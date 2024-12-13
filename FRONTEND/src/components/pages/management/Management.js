import * as React from 'react';
import UserMan from './UserMan'
import CreateAccount from './CreateAccount'
import TeamsMan from './teamsMan/TeamsMan';
import { useState, useEffect } from 'react';
import SearchBar from '../../search/SearchBar';
import { useTranslation } from 'react-i18next';

export default function Management(props) {
  const [page, setPage] = useState("userman")
  const [admin] = useState(props.permissions === "ADMIN")
  const [manager] = useState(props.permissions === "MANAGER")
  const { t } = useTranslation();

  useEffect(() => {
    if(manager) {
      setPage("teamsMan");
    }
  },[])

  return (
    <div>
      <div className='row alert alert-light p-0 mt-0'
          style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
          <ul className='nav nav-pills nav-fill'>

            <SearchBar/>

            {admin && (<span className={page==="userman"?
              'm-1 btn btn-sm btn-outline active':
              'm-1 btn btn-sm btn-outline'}
              onClick={()=>setPage("userman")}>{t('accountsMenuBarManagementButton')}</span>)}
            
            {admin && (<span className={page==="adduser"?
              'm-1 btn btn-sm btn-outline active':
              'm-1 btn btn-sm btn-outline'} onClick={()=>setPage("adduser")}>{t('accountsMenuBarCreateButton')}</span>)}

            {(admin || manager) && (<span className={page==="teamsMan"?
              'm-1 btn btn-sm btn-outline active':
              'm-1 btn btn-sm btn-outline'} onClick={()=>setPage("teamsMan")}>{t('accountsMenuBarTeamManagementButton')}</span>)}
          </ul>
      </div>
      <div className='p-2'>
          {page === 'userman'      && admin && <UserMan/>}
          {page === 'adduser'      && admin && <CreateAccount/>}
          {page === 'teamsMan'    && (admin || manager) && <TeamsMan/>}
      </div>
    </div>
  );
}