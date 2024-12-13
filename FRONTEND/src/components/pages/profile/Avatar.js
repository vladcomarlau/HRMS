import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import blank from '../../../blank.jpg';

export default function Avatar (props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [avatarId, setAvatarId] = useState("");
  const [avatarData, setAvatarData] = useState("");
  
  const getCurrentUser = () => {
    if(props.id != null) {
      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        method: "GET",
        url: `http://localhost:8082/users/${props.id}`
      }).then((responseAuth) => {
          setCurrentUser(responseAuth.data);
          if(responseAuth.data.avatar != null) {
            setAvatarId(responseAuth.data.avatar.id)
          } else {
            setAvatarData(blank);
          }
      }).catch(function (error) {
          console.log(error.message)
      });
    }
  }

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
    }).catch(function (error) {
      console.log(error.message);
    });
  }
  
  useEffect( () => {
    getCurrentUser();
    window.addEventListener('refreshAvatar',getCurrentUser);
    return (() => {
      window.removeEventListener('refreshAvatar',getCurrentUser);
    }) 
  },[])

  useEffect( () => {
    if(currentUser != null) {
      if(avatarId && avatarId.length > 0) {
        fetchAvatar();
      }
    }
  },[currentUser])

  return (
    <div onDragStart={(e) => {e.preventDefault()}}
        style={{height:props.size, width:props.size}}>
      <img src={avatarData}
        className="rounded-circle bg-white"
        style={{width: props.size, height: props.size, objectFit: "cover",
          border:"1px solid #d4d4d4"}} 
        alt="" loading="lazy"/>
    </div>
  );
}
