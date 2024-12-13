import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProfileCard from '../organization/ProfileCard';

export default function Colleagues(props) {
    //PROPS
    //currentUser = obj
    //managerId = id

    const [subordinatesElements, setSubordinatesElements] = useState(null);

    useEffect( () => {
        if(props.currentUser != null && props.managerId != null) {
            axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/users/${props.managerId}/hierarchy`
            }).then((response) => {
            if(response.data != null) {
                let subordinatesElementsTemp = 
                response.data.subordinates
                .filter(function( obj ) {
                    return (
                        obj.firstName !== props.currentUser.firstName
                        && obj.lastName !== props.currentUser.lastName
                    );
                })
                .reduce(function (rows, key, index) { 
                    return (index % 2 == 0 ? rows.push([key]) 
                    : rows[rows.length-1].push(key)) && rows;
                }, [])
                .map((e)=>
                (e != null) && (
                    <div className='row m-0 p-0'>

                        {e[0] != null && (
                        <div className='col-6 border-bottom border-end p-1'>
                            <ProfileCard id={e[0].id}/>
                        </div>)}

                        {e[1] != null && (
                        <div className='col-6 border-bottom p-1'>
                            <ProfileCard id={e[1].id}/>
                        </div>)}

                    </div>
                ));
                setSubordinatesElements(subordinatesElementsTemp);
            }
            }).catch(function (error) {
                console.log(error.message);
                window.location.reload();
            });
        }
    },[props.managerId])
    
    return (
        <div>
            {subordinatesElements != null && subordinatesElements}
        </div>
    )
}
