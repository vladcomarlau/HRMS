import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Team from '../organization/Team';
import ProfileCard from '../organization/ProfileCard';
import * as Icon from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

export default function TeamsSalary() {
  const { t } = useTranslation();
  const [managers, setManagers] = useState([]);
  const [managerCards, setManagerCards] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [updated, setUpdated] = useState("");
  const [totalSalaries, setTotalSalaries] = useState([0,0,0,0,0,0,0,0]);
  const [totalTeams, setTotalTeams] = useState([]);
  const [teamMaxId, setTeamMaxId] = useState(0);
  const [teamMinId, setTeamMinId] = useState(0);
  const [users, setUsers] = useState([]);

  const getSalariesAccounts = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/salaries/users`
    }).then((response) => {
      setManagers(response.data.filter(leaderFilter));
      response.data.map(function(a) {
        
        a.fullName = a.firstName + " " + a.lastName;
        
        if(a.salaries.length > 0) {
          a.currentSalary = a.salaries[a.salaries.length-1];
        } else {
          a.currentSalary = [];
        }
        return a;
      })

      calculateTotals(response.data);

      setUsers(response.data);
      setUpdated(!updated);
    }).catch(function (error) {
      console.log(error.message);
      localStorage.clear();
      window.location.reload();
    });
  }

  const compareTeamsByCost = (a, b) => {
    return b.totalCostTeam - a.totalCostTeam;
  }

  const calculateTotals = (responseData) => {
    let total = 0;
      let totalBase = 0;
      let totalBonusPerf = 0;
      let totalBonusProj = 0;
      let totalMealTickets = 0;
      let totalInsurance = 0;
      let totalBenefits = 0;

      if(responseData.length > 0) {
        for(let i = 0; i < responseData.length; i++) {
          let totalUser = 0;
          if(responseData[i].salaries.length > 0) {
            totalUser = responseData[i].salaries[responseData[i].salaries.length-1].total;
            totalBase += responseData[i].salaries[responseData[i].salaries.length-1].base
            totalBonusPerf += responseData[i].salaries[responseData[i].salaries.length-1].performanceBonus;
            totalBonusProj += responseData[i].salaries[responseData[i].salaries.length-1].projectBonus;
            totalMealTickets += responseData[i].salaries[responseData[i].salaries.length-1].mealTickets;
            totalInsurance += responseData[i].salaries[responseData[i].salaries.length-1].lifeInsurance;
            totalBenefits += responseData[i].salaries[responseData[i].salaries.length-1].subscriptions;
          }
          total += totalUser;
        }
      }
      setTotalSalaries([total, totalBase,
        totalBonusPerf, totalBonusProj,
        totalMealTickets, totalInsurance,
        totalBenefits
      ])
  }

  useEffect(() => {
    getSalariesAccounts();
    const handleRefresh = () => {
      getSalariesAccounts();
      setSelectedManager(null);
      setManagerCards([]);
      setSearchInput("");
      setUpdated(!updated);
    }

    window.addEventListener("refreshAllTeams", handleRefresh);
    return (() => {
      window.removeEventListener("refreshAllTeams", handleRefresh);
    })
  },[])

  const leaderFilter = (manager) => {
    return manager.hasSubordinates;
  }

  const searchFilter = (oldRow) => {
    if (searchInput != null && searchInput.length > 0) {
      if(oldRow != null){
        const {manager, avatar, subordinates, authorities, 
          address, cnp, employmentDate, birthdate, createdAt, updatedAt, 
          password, subordinatesCount, ...row} = oldRow;
        let matchesName = (row.firstName + " " + row.lastName)
            .toLowerCase().includes(searchInput.toLowerCase());
        let matchesNameReversed = (row.lastName + " " + row.firstName)
            .toLowerCase().includes(searchInput.toLowerCase());
        return JSON.stringify(row).toLowerCase().includes(searchInput.toLowerCase())
            || matchesName
            || matchesNameReversed;
      } else {
        return true;
      }
    } else {
      return true;
    } 
  }

  const handleManagerSelection = (manager) => {
    setSelectedManager(manager);
  }

  const formatCurrency = (value) => {
    return value.toLocaleString('ro-RO', { style: 'currency', currency: 'ron' });
  };

  useEffect(() => {
    let teams = [];
    for(let i = 0; i < managers.length; i++) {
      teams.push(users.filter((user) => {if(user.manager != null){ 
        return user.manager.id === managers[i].id 
      }}))
    }

    for(let i = 0; i < teams.length; i++) {
      let totalTeam = 0;
      for(let j = 0; j < teams[i].length; j++) {
        if(teams[i][j].currentSalary != undefined
          && teams[i][j].currentSalary.total != undefined) {
          totalTeam += teams[i][j].currentSalary.total;
        }
      }
      if(managers[i].currentSalary != null
      && managers[i].currentSalary.total != null)
      {
        totalTeam += managers[i].currentSalary.total;
      }
      totalTeams.push(totalTeam);
      managers[i].totalCostTeam = totalTeam;
    }

    if(managers != undefined && totalTeams != undefined
      && managers.length > 0 && totalTeams.length > 0) {
      setTeamMaxId(managers[totalTeams.indexOf(Math.max(...totalTeams))].id);
      setTeamMinId(managers[totalTeams.indexOf(Math.min(...totalTeams))].id);
    }
    
    setManagerCards(managers.filter(searchFilter).sort(compareTeamsByCost)
    .map((elem, index) =>
    (<div className='mx-0 p-2 col-12 col-sm-6 col-md-6 col-lg-4'>
        {elem != null && (
        <div key={index+updated} className='btn btn-outline-light alert alert-light py-1 mx-0 px-0'
          style={{width:"100%", height:"100%"}}
          onClick={() => handleManagerSelection(elem)}> 
          <ProfileCard key={index} id={elem.id} count={elem.subordinatesCount}/>
          <div className='border rounded p-3 mx-3 text-start'>
            {t('salariesCosts')}:
            <div className='fw-bold text-start'>
              {elem.totalCostTeam!=null && (formatCurrency(elem.totalCostTeam))}
            </div>
            <div className='fw-bold text-start fs-5'>
              {(Math.round(elem.totalCostTeam/totalSalaries[0]*100 * 100) / 100).toFixed(2)} % <section style={{display:"inline"}} className='fw-normal fs-6 text-secondary'> {t('salariesCosts2')} </section>
            </div>
          </div>
        </div>)} 
    </div>)));
    setUpdated(!updated);
  },[searchInput, managers])

  const search = (
    <div className="mt-2 col-12 col-xs-12 col-md-7 col-lg-5">
      <div className="text-start">
          <div className="input-group">
              <input className="form-control border" type="search" 
                  placeholder={t('teamSalarySearchLeader')} onChange={(e) => {
                    setSearchInput(e.target.value);
                  }}/>
          </div>
      </div>
    </div>)

  const searchComponent = (
    <div className='text-secondary alert alert-light mt-4'>
      {t('totalTeams')}: {managers.length}
      {search}
      {searchInput.length > 0 && 
        <div className='mt-3'>
          {t('salaryPackageSearchResults')}: {managerCards.length}
        </div>}
    </div>
  )

  const handleReturnToAllTeams = () => {
    getSalariesAccounts();
    setSelectedManager(null);
    setManagerCards([]);
    setSearchInput("");
    setUpdated(!updated);
  }

  return (
    <div>
      <h3 className='fw-lighter'><Icon.Bank size={22} style={{marginBottom:'4px', marginRight:'4px'}}/><Icon.PeopleFill size={22} style={{marginBottom:'4px'}}/> {t('teamsSalaryTitle')}</h3><hr/>
      <div className='alert alert-warning'>
        {t('teamsSalaryAlertInfo')}
      </div>
      {(selectedManager == null) && 
      (<h5 className='fw-light text-secondary'>{t('teamsSalaryDescription')}</h5>) &&
      (<div className='row'>
        <div className='col-md-6'>
          <div className='alert alert-light' style={{height:"110px"}}>
            <h5 className='fw-light custom-sm-font' style={{marginBottom:"-10px"}}><Icon.InfoCircleFill className='mx-1'/> {t('teamSalaryTeamWith')} <section className='fw-bold' style={{display:'inline'}}>{t('teamSalaryMaxCost')}: {formatCurrency(Math.max(...totalTeams))}</section></h5>
            <ProfileCard key={updated} id={teamMaxId}/>
          </div>
        </div>
        <div className='col-md-6'>
          <div className='alert alert-light' style={{height:"110px"}}>
            <h5 className='fw-light custom-sm-font' style={{marginBottom:"-10px"}}><Icon.InfoCircleFill className='mx-1'/> {t('teamSalaryTeamWith')} <section className='fw-bold' style={{display:'inline'}}>{t('teamSalaryMinCost')}: {formatCurrency(Math.min(...totalTeams))}</section></h5>
            <ProfileCard key={updated} id={teamMinId}/>
          </div>
        </div>
      </div>)}
      <div className='px-2'>
        {(selectedManager != null 
        ? ((
          <div>
            <button className='btn btn-sm btn-outline-primary border-0'
              style={{marginBottom:"2px"}}
              onClick={() => handleReturnToAllTeams()}>
                <Icon.ArrowReturnLeft/> {t('allTeams')}
            </button>
            <Team currentUser={selectedManager} for={"allTeams"} cost={true}/>
          </div>))
        : (searchComponent))}
        {selectedManager == null && (<div className='row flexrow' style={{overflow:"scroll", maxHeight:"650px"}}>{managerCards} </div>)}
      </div>
    </div>
  );
}