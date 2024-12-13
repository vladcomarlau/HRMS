import * as React from 'react';
import SearchBar from '../../search/SearchBar';
import * as Icon from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';
import MyPerformance from './MyPerformance';
import PerformanceMan from './PerformanceMan';
import PerformanceTeams from './PerformanceTeams';
import { useTranslation } from 'react-i18next';

export default function Performance(props) {
  // props 
  // id
  // currentUser = user
  // goToAdminPerf = bool
  // permissions = string
  const [page, setPage] = useState("my_performance");
  const [admin] = useState(props.permissions === "ADMIN");
  const [manager] = useState(props.permissions === "MANAGER");
  const [currentUser] = useState(props.currentUser);
  const { t } = useTranslation();
  
  useEffect( () => {
    if(props.goToAdminPerf == true) {
      setPage("performance_man");
    } else {
      setPage("my_performance");
    }
  },[])

  return (
    <div>
      <div className='row alert alert-light p-0 mt-0'
        style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
        <ul className='nav nav-pills nav-fill'>
          <SearchBar/>
          <span className={page==="my_performance"?
          'm-1 btn btn-sm btn-outline active':
          'm-1 btn btn-sm btn-outline'}
          onClick={()=>setPage("my_performance")}>{t('performanceMenuBarPersonal')}</span>
          
          {(admin || manager) && (<span className={page==="performance_teams"?
          'm-1 btn btn-sm btn-outline active':
          'm-1 btn btn-sm btn-outline'} onClick={()=>setPage("performance_teams")}>
              <Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('performanceMenuBarTeamsAdmin')}</span>)}

          {(admin || manager) && (<span className={page==="performance_man"?
          'm-1 btn btn-sm btn-outline active':
          'm-1 btn btn-sm btn-outline'} onClick={()=>setPage("performance_man")}>
              <Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('performanceMenuBarAccountsAdmin')}</span>)}
        </ul>
      </div>
      <div className='p-2'>
        <div className='p-2'>
          {page === 'my_performance' && <MyPerformance id={props.id}/>}
          {page === 'performance_man'  && (admin || manager) && <PerformanceMan currentUser={currentUser}/>}
          {page === 'performance_teams'  && (admin || manager) && <PerformanceTeams currentUser={currentUser}/>}
        </div>
      </div>
    </div>)
}
