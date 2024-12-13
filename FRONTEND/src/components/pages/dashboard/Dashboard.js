import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as Icon from 'react-bootstrap-icons';
import SearchBar from '../../search/SearchBar';
import DashButton from './DashButton';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const [content, setContent] = useState("");
  const [managers, setManagers] = useState([]);

  const { t } = useTranslation();
  
  const getContent = () => {
    axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        method: "GET",
        url: `http://localhost:8082/users/jwt`
    }).then((response) => {
      setContent(response.data);
    }).catch(function (error) {
      localStorage.clear();
      window.dispatchEvent(new Event("storage"));
      console.log(error.message);
    });
  }

  const fetchUsers = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/users`
    }).then((responseAuth) => {
      setManagers(responseAuth.data.filter(leaderFilter));
    }).catch((error) => {
      console.log(error.message);
    })
  }

  const leaderFilter = (manager) => {
    return manager.hasSubordinates;
  }

  const page = (name) => {
    window.dispatchEvent(new Event(name));
  }

  function seniority (employmentDate) {
    const dateOne = new Date(employmentDate);
    const dateTwo = new Date(); 

    const monthDiff = Math.abs(dateOne.getMonth() - dateTwo.getMonth() +
    (12 * (dateOne.getFullYear() - dateTwo.getFullYear())));
    return([Math.floor(monthDiff/12),
      monthDiff - 12 * Math.floor(monthDiff/12)])
  }

  useEffect( () => {
    getContent();
    fetchUsers();

    const getContentIfToken = () => {
      const token = localStorage.getItem('token')
      if( token && token.length !== 0) {
        getContent();
      }
    }
    window.addEventListener('storage',getContentIfToken);
    return(() => {
      window.removeEventListener('storage',getContentIfToken);
    })
  },[])

  const navigate = useNavigate(); 
  const routeChange = (path) =>{ 
      let newPath = `/${path}`; 
      navigate(newPath);
  }

  const peopleIcon = <Icon.PeopleFill size={70}/>
  const profileIcon = <Icon.PersonLinesFill size={70}/>
  const collectionIcon = <Icon.Collection size={70}/>
  const dayOffIcon = <Icon.FileEarmark size={70}/>
  const barChartIcon = <Icon.BarChart size={70}/>
  const bankIcon = <Icon.Bank size={70}/>
  const daysOffManIcon = <Icon.FileEarmarkPerson size={70}/>
  const accountEditIcon = <Icon.PersonFillGear size={70}/>

  if(content){
    return (
      <div>
        <div className='row alert alert-light p-0 mt-0'
          style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
          <ul className='nav nav-pills nav-fill'>
            <SearchBar/>
          </ul>
        </div>
        <div className='p-2'>
          <h3 className='fw-lighter'><Icon.HouseFill size={20} style={{marginBottom:'3px'}}/> {t('dashboardTitle')}</h3><hr/>
          <h5 className='fw-light'>{t('welcomeMessage')}, {content.firstName} {content.lastName}! 👋</h5>
          <br></br>
          <div className='mt-4 row justify-content-center'>
            {content != null && profileIcon != null 
              && (<DashButton text={t('dashboardProfile')} 
                icon={profileIcon} 
                subText={seniority(content.employmentDate)[0] + " " + t('dashboardProfileDetails') }
                onClick={() => {page("profile"); routeChange("profile");}}/>)}
            {content != null && content.manager != null 
              && (<DashButton text={t('dashboardColleagues')} 
                subText={content.manager.subordinatesCount-1 + " " + t('dashboardColleaguesDetails')} 
                icon={peopleIcon}
                onClick={() => {page("myTeam"); routeChange("organization");}}/>)}
            {managers != null
              && (<DashButton text={t('dashboardAllTeams')}
                icon={collectionIcon}
                subText={managers.length + " " + t('dashboardAllTeamsDetails')}
                onClick={() => {page("allTeams"); routeChange("organization");}}/>)}
            {managers != null 
              && (<DashButton text={t('dashboardLeaves')} 
                icon={dayOffIcon}
                subText={content.leaveDays + " " + t('dashboardLeavesDetails')}
                onClick={() => {page("leaves"); routeChange("leaves");}}/>)}
          </div>
          <div className='row justify-content-center'>
            {content != null && (content.role === "ADMIN" || content.role === "MANAGER")
                && (
                  <> 
                    <DashButton text={t('dashboardPerformance')} 
                        icon={barChartIcon}
                        subText={""}
                        onClick={() => {page("manPerfAcc"); routeChange("performance");}}
                        unlocked/>
                      <DashButton text={t('dashboardSalaries')} 
                        icon={bankIcon}
                        subText={""}
                        onClick={() => {page("manSalAcc"); routeChange("salaries");}}
                        unlocked/>
                      <DashButton text={t('dashboardLeavesAdmin')} 
                        icon={daysOffManIcon}
                        subText={""}
                        onClick={() => {page("manDaysOffAcc"); routeChange("leaves");}}
                        unlocked/>
                      <DashButton text={t('dashboardAccounts')} 
                        icon={accountEditIcon}
                        subText={""}
                        onClick={() => {page("manAcc"); routeChange("accounts");}}
                        unlocked/>
                  </>
                )
              }
          </div>
        </div>
      </div>
  )}
}