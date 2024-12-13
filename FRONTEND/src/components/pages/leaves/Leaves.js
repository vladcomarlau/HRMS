import * as React from 'react';
import SearchBar from '../../search/SearchBar';
import axios from 'axios';
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import MyLeaves from './MyLeaves';
import LeavesAdmin from './LeavesAdmin';
import PublicHolidaysAdmin from './PublicHolidaysAdmin'
import { useTranslation } from 'react-i18next';

export default function Leaves(props) {
  // PROPS
  // currentUser = user
  // permissions = string
  // leaveDays = currentUser.leaveDaysBalance
  // goToAdminDaysOff = bool
  const [currentUser, setCurrentUser] = useState(props.currentUser);
  const [page, setPage] = useState("myLeaves");
  const [admin] = useState(props.permissions === "ADMIN");
  const [manager] = useState(props.permissions === "MANAGER");
  const [goToAdminDaysOff] = useState(props.goToAdminDaysOff);
  const { t } = useTranslation();

  useEffect( () => {
    getCurrentUser();
    if(goToAdminDaysOff) {
      setPage("leavesAdmin");
    } else {
      setPage("myLeaves");
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

  return (
    <div>
      <div className='row alert alert-light p-0 mt-0'
        style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
          <ul className='nav nav-pills nav-fill'>
            
            <SearchBar/>

            {(<span className={page==="myLeaves" ? 
                'm-1 btn btn-sm btn-outline active'
                : 'm-1 btn btn-sm btn-outline'}
              onClick={()=>setPage("myLeaves")}>{t('leavesCalendarButton')}</span>)}
            {(admin || manager) && (<span className={page==="leavesAdmin" ? 
                'm-1 btn btn-sm btn-outline active'
                : 'm-1 btn btn-sm btn-outline'}
              onClick={()=>setPage("leavesAdmin")}><Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('leavesManagementButton')}</span>)}
            {(admin || manager) && (<span className={page==="publicHolidaysAdmin" ? 
                'm-1 btn btn-sm btn-outline active'
                : 'm-1 btn btn-sm btn-outline'}
              onClick={()=>setPage("publicHolidaysAdmin")}><Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('leavesHolidayManagementButton')}</span>)}
          </ul>
      </div>

      <div className='p-2'>
        {page === 'myLeaves' && (<MyLeaves currentUser={props.currentUser} leaveDays={props.leaveDays}/>)}
        {page === 'leavesAdmin' && (admin || manager) && (<LeavesAdmin currentUser={props.currentUser}/>)}
        {page === 'publicHolidaysAdmin' && (admin || manager) && (<PublicHolidaysAdmin currentUser={props.currentUser}/>)}
      </div>
    </div>
  );
}
