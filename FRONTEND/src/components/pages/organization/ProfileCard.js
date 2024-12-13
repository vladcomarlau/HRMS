import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import blank from '../../../blank.jpg';
import * as Icon from 'react-bootstrap-icons';

export default function ProfileCard(props) {
  //PROPS ID
  //      count
  //      small = boolean
  //      knob = 0-100
  const [user, setUser] = useState(null);
  const [avatarId, setAvatarId] = useState("");
  const [avatarData, setAvatarData] = useState("");
  const [size, setSize] = useState("50");

  const fetchUser = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/users/` + props.id
    }).then((responseAuth) => {
      setUser(responseAuth.data);
      setAvatarId(responseAuth.data.avatar.id);
    }).catch((error) => {
      console.log(error.message);
    })
  }

  useEffect(() => {
    fetchUser();
    if(props.small) {
      setSize("40px");
    } else {
      setSize("50px");
    }
  },[])
  
  const fetchAvatar = () => {
    axios.get("http://localhost:8082/avatars/"+avatarId, {
      responseType: 'arraybuffer',
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    }).then((response) => {
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),''));
      setAvatarData(`data:;base64,${base64}`);
      window.dispatchEvent(new Event("refreshProfile"))
    }).catch(function (error) {
      console.log(error.message);
    });
  }

  useEffect( () => {
    if(user != null) {
      if(avatarId && avatarId.length > 0) {
        fetchAvatar();
      }
    }
  },[user])

  return (
    (user != null && (
      <section className={ (props.border ? `text-center alert alert-light border-secondary-subtle w-100 bg-white ${ props.className }`
        :`text-center alert alert-light w-100 border-0 bg-transparent ${ props.className }`)}>
        <div className={`mb-1 row`} style={{padding:"0px", margin:"1px",
            minWidth:"150px"}}>
          <img src={avatarData == null ? blank : avatarData} 
            onDragStart={(e) => {e.preventDefault()}}
            className="col-4 p-0 rounded-circle border"
            style={{width:size, height: size, objectFit: "cover",}} 
            alt="" loading="lazy"/>
          <div style={{padding:"0px", margin:"2px 0px 3px 7px", width:"70%"}}
            className= {props.small ? 'text-start custom-sm-font2' : 'text-start'} >
                <div>
                  {props.count > 0 && (
                    <span style={{paddingBottom:"2px"}} className='me-1 pe-2 border rounded bg-secondary-subtle text-dark'>
                      <span style={{marginLeft:"8px", marginRight:"2px"}}><Icon.PeopleFill/></span>
                      <small className='fw-bold'>{props.count}</small>
                  </span>)}
                  {user.firstName} {user.lastName} 
                  <br></br><small className='text-muted '>{user.jobTitle}</small>
                </div>
          </div>
        </div>
      </section>
    ))
  )
}
