import * as React from 'react';
import SearchBar from '../../search/SearchBar';
import * as Icon from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';
import MySalary from './MySalary';
import SalariesMan from './SalariesMan';
import TeamsSalary from './TeamsSalary';
import { useTranslation } from 'react-i18next';

export default function Salaries(props) {
  // props.goToAdminSal = bool
  const [page, setPage] = useState("salary")
  const [admin] = useState(props.permissions === "ADMIN")
  const [manager] = useState(props.permissions === "MANAGER")
  const { t } = useTranslation();
  
  useEffect( () => {
    if(props.goToAdminSal == true) {
      setPage("admin_salary");
    } else {
      setPage("salary");
    }
  },[])

  return (
    <div>
      <div className='row alert alert-light p-0 mt-0'
        style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
        <ul className='nav nav-pills nav-fill'>
          <SearchBar/>
          <span className={page==="salary"?
            'm-1 btn btn-sm btn-outline active':
            'm-1 btn btn-sm btn-outline'}
          onClick={()=>setPage("salary")}>{t('salaryMenuPersonal')}</span>
          {(admin || manager) && (<span className={page==="teams_salary"?
            'm-1 btn btn-sm btn-outline active':
            'm-1 btn btn-sm btn-outline'} onClick={()=>setPage("teams_salary")}>
                <Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('salaryMenuTeams')}</span>)}
          {(admin || manager) && (<span className={page==="admin_salary"?
            'm-1 btn btn-sm btn-outline active':
            'm-1 btn btn-sm btn-outline'} onClick={()=>setPage("admin_salary")}>
                <Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('salaryMenuAdmin')}</span>)}
        </ul>
      </div>
      <div className='p-2'>
        {page === 'salary'                              && <MySalary id={props.id}/>}
        {page === 'admin_salary'  && (admin || manager) && <SalariesMan/>}
        {page === 'teams_salary' && (admin || manager) && <TeamsSalary/>}
      </div>
    </div>
  );
}
