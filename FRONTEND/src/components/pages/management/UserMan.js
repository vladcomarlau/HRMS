import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import UsersTable from './UsersTable';
import * as Icon from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

export default function UserMan() {
  const [content, setContent] = useState([]);
  const { t } = useTranslation();

  useEffect( () => {
    const getContent = () => {
      axios.request({
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: "GET",
          url: `http://localhost:8082/users`
      }).then((response) => {
        setContent(response.data)
      }).catch(function (error) {
        console.log(error.message)
        localStorage.clear();
        window.dispatchEvent(new Event("storage"));
        window.location.reload();
      });
    }
    
    const getContentIfToken = () => {
      const token = localStorage.getItem('token')
      if( token && token.length !== 0){
        getContent();
      }
    }

    getContent();
    
    window.addEventListener('refreshList', getContent);
    window.addEventListener('storage', getContentIfToken);

    return( () => {
      window.removeEventListener('refreshList', getContent);
      window.removeEventListener('storage', getContentIfToken);
    })

  },[])


  if(content){
    return (
      <div>
        <h3 className='fw-lighter'><Icon.PersonFillGear size={24} style={{marginBottom:'5px'}}/> {t('accountsManagementTitle')}</h3><hr/>
        <UsersTable data={content}/>
      </div>)
  }

  return (
    <></>
  );
}
