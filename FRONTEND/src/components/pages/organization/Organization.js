import * as React from 'react';
import SearchBar from '../../search/SearchBar';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Team from './Team';
import AllTeams from './AllTeams';
import Organigram from './Organigram';
import * as Icon from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

export default function Organization(props) {
  //props
  //goToMyTeam = boolean
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("allTeams");
  const { t } = useTranslation();

  useEffect( () => {
    getCurrentUser();
    if(props.goToMyTeam == true) {
      setPage("yourTeam");
    }
  },[])

  const getCurrentUser = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/users/jwt`
    }).then((responseAuth) => {
        setCurrentUser(responseAuth.data);
    }).catch(function (error) {
        console.log(error.message)
        window.location.reload();
    });
  }

  const handleSetYourTeam = (x) => {
    setPage(x);
  }

  const pageContent = () => {
    if(currentUser != null) {
      return(
        <div>
          {page === "organigram" && (
            <div><Organigram/></div>)}
          {page === "yourTeam" && currentUser.manager != null && (
            <div><Team currentUser={currentUser} manager={currentUser.manager.id} 
              for={"yourTeam"}/></div>)}
          {page === "subordinates" && (
            <div><Team currentUser={currentUser} 
              for={"subordinates"}/></div>)}
          {page === "allTeams" && (
            <div><AllTeams/></div>)}
        </div>
      )
    }
  }

  const noManager = (
    <h5 className='fw-light alert alert-warning'>{t('organizationNoManager')}</h5>
  )

  const noSubordinates = (
    <h5 className='fw-light alert alert-warning'>{t('organizationNoSubordinates')}</h5>
  )

  const handleAllPages = () => {
    setPage("allTeams");
    window.dispatchEvent(new Event("refreshAllTeams"));
  }

  const handleOrganigram = () => {
    setPage("organigram");
  }

  return (
    <div>
      <div className='row alert alert-light p-0 mt-0'
        style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
          <ul className='nav nav-pills nav-fill'>
            
            <SearchBar/>

            {(<span className={page==="organigram" ? 
                'm-1 btn btn-sm btn-outline active'
                : 'm-1 btn btn-sm btn-outline'}
              onClick={()=>handleOrganigram()}>{t('organizationMenuBarOrganigram')}</span>)}
            {(<span className={page==="allTeams" ? 
                'm-1 btn btn-sm btn-outline active'
                : 'm-1 btn btn-sm btn-outline'}
              onClick={()=>handleAllPages()}>{t('organizationMenuBarAllTeams')}</span>)}
            {(<span className={page==="yourTeam" ? 
                'm-1 btn btn-sm btn-outline active'
                : 'm-1 btn btn-sm btn-outline'}
              onClick={()=>{handleSetYourTeam("yourTeam")}}>{t('organizationMenuBarDirectColleagues')}</span>)}
            {(<span className={page==="subordinates" ? 
                'm-1 btn btn-sm btn-outline active'
                : 'm-1 btn btn-sm btn-outline'} 
              onClick={()=>{handleSetYourTeam("subordinates")}}>{t('organizationMenuBarSubordinates')}</span>)}
          </ul>
      </div>

      <div className='p-2'>
        <h3 className='fw-lighter'><Icon.PeopleFill size={24} style={{marginBottom:'4px'}}/> {t('organizationTitle')}</h3><hr/>
        {(page === "yourTeam" 
            && currentUser != null 
            && currentUser.manager === null 
            && noManager)}
        {(page === "subordinates" 
          && currentUser != null 
          && currentUser.hasSubordinates == false 
          && noSubordinates)}
        {currentUser != null && pageContent()}
      </div>
    </div>
  );
}
