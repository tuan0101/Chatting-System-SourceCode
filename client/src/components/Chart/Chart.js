import React, { useState, useEffect, useContext} from "react";

import { Bar, Line } from 'react-chartjs-2';
import "./Chart.css";
import axios from "axios";
import { UserContext } from '../../App';

function Chart() {
    const [userClicks, setUserClicks] = useState([]);
    const [clickDates, setClickDates] = useState(null);
    const [clickCounts, setClickCount] = useState();
    const [clickCounts2, setClickCount2] = useState();

    const { state } = useContext(UserContext);

    const getProfileClick = (userid) => {
        axios.get(`http://localhost:5000/user/${userid}`, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
          })
            .then((response) => {
                setUserClicks(response.data.user.profileClicks);
                // console.log('userClicks111', userClicks);

            })
            .catch((err) => {
                console.log(err);
            })
    }

    useEffect(()=>{
        getProfileClick(state._id);

    }, [])

    useEffect(()=>{
        let dateArray = {}
        if(userClicks.length > 0){
            userClicks.map((click)=>{
                const index = click.date.substring(4, 15);
                dateArray[index] = (dateArray[index] || 0)+1;
            })
        }
        setClickDates(dateArray);
    }, [userClicks])


    useEffect(()=>{
        let clickChartDate;
        if(clickDates){
            const dates = Object.keys(clickDates);
            const clickCounts = Object.values(clickDates);
            console.log('dates', dates);
            clickChartDate = {
                labels: dates,
                datasets: [
                    {
                        label: 'Click Counts',
                        data: clickCounts,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    }
                ]
            }
            let clickChartDate2 = JSON.parse(JSON.stringify(clickChartDate)) ;
            clickChartDate2.datasets[0].backgroundColor = 'green';


            setClickCount(clickChartDate);
            setClickCount2(clickChartDate2);
        }
    }, [clickDates])

    return (
        <div className='chart'>
            <Bar
                data={clickCounts}
                width={500}
                height={300}
            // options={{ maintainAspectRatio: false }}
            />

            <Line
                data={clickCounts2}
                options={{
                    title: {
                        // display: 'line bar',
                        text: 'Largest Cities In ',
                        fontSize: 25
                    },
                    legend: {
                        // display: this.props.displayLegend,
                        // position: this.props.legendPosition
                    }
                }}
            />
        </div>
    )
}

export default Chart
