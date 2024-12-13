import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Team from './Team';
import ProfileCard from './ProfileCard';
import * as Icon from 'react-bootstrap-icons';
import { useReducer } from 'react';
import { Knob } from 'primereact/knob';
import { useTranslation } from 'react-i18next';

export default function AllTeams(props) {
  // props.small = boolean
  // props.evaluations = boolean
  // props.arrEvaluations = array
  const [managers, setManagers] = useState([]);
  const [managerCards, setManagerCards] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [small] = useState(props.small);
  const [evaluationsBool] = useState(props.evaluations)
  const [teamMax, setTeamMax] = useState(0);
  const [teamMaxId, setTeamMaxId] = useState(0);
  const [teamMin, setTeamMin] = useState(0);
  const [teamMinId, setTeamMinId] = useState(0);
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState([]);


  useEffect(() => {
    fetchUsers();
    const handleRefresh = () => {
      fetchUsers();
      setSelectedManager(null);
      setManagerCards([]);
      setSearchInput("");
    }
    window.addEventListener("refreshAllTeams", handleRefresh);
    return (() => {
      window.removeEventListener("refreshAllTeams", handleRefresh);
    })
  },[])

  const fetchUsers = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/evaluations/teams`
    }).then((response) => {
      setManagers(response.data.teams);
      if(props.evaluations) {
        setEvaluations(response.data);
        setTeamMax((response.data.teamMaxAverage*100).toFixed(0));
        setTeamMaxId(response.data.teamMaxId);
        setTeamMin((response.data.teamMinAverage*100).toFixed(0));
        setTeamMinId(response.data.teamMinId);
        forceUpdate();
      }
    }).catch((error) => {
      console.log(error.message);
      localStorage.clear();
      window.location.reload();
    })
  }

  const searchFilter = (oldRow) => {
    if (searchInput != null && searchInput.length > 0) {
      if(oldRow != null){
        const {manager, correlationElements, avatar, subordinates, authorities, 
          address, cnp, employmentDate, birthdate, createdAt, updatedAt, 
          password, subordinatesCount, currentEvaluation, ...row} = oldRow;
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

  const grade = (val) => {
    let grade = (<div className='badge shadow mx-2'>{t('perfNoGrade')}</div>);
    let blue = "rgb(80,148,247)";
    let green = "rgb(64,132,88)";
    let red = "rgb(203,68,74)";
    let yellow = "rgb(245,195,68)";
    let selectedColor = blue;
    switch (true) {
      case (val < 35):
        grade = <div className='badge shadow mx-2 bg-danger'>{t('perfUnsatisfying')}</div>;
        selectedColor = red;
        break;
      case (val < 50):
        grade = <div className='badge shadow mx-2 bg-warning'>{t('perfSatisfying')}</div>;
        selectedColor = yellow;
        break;
      case (val < 65):
        grade = (<div className='badge shadow mx-2 bg-success'>{t('perfGood')}</div>);
        selectedColor = green;
        break;
      case (val < 90):
        grade = <div className='badge shadow mx-2 bg-success'>{t('perfVeryGood')}</div>;
        selectedColor = green;
        break;
      case (val <= 100):
        grade = <div className='badge shadow mx-2 bg-success'>{t('perfExceptional')}</div>;
        selectedColor = green;
        break;
    }
    return [grade, selectedColor];
  }

  const compareTeamsByEvaluations = (a, b) => {
    return b.evaluationsAverage - a.evaluationsAverage;
  }

  useEffect(() => {
    if(props.evaluations) {
      managers.sort(compareTeamsByEvaluations);
    }
    setManagerCards(managers.filter(searchFilter)
    .map((elem, index) =>
    (<div className='mx-0 p-2 col-12 col-sm-6 col-md-6 col-lg-4'>
      {elem != null && (
        <div key={_} className='btn btn-outline-light alert alert-light py-1 mx-0 px-0'
          style={{width:"100%", height:"100%"}}
          onClick={() => handleManagerSelection(elem)}>
        <ProfileCard key={index} id={elem.id} count={elem.subordinatesCount} small={small}/>
        {props.evaluations && 
        (evaluations && elem.evaluationsAverage != undefined ? 
          (<div key={_}>{t('perfTeamsTeamAverage')}
            <Knob value={(elem.evaluationsAverage*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((elem.evaluationsAverage*100).toFixed(0))[1]} readOnly/>
            {grade((elem.evaluationsAverage*100).toFixed(0))[0]}
          </div>)
          : 
          (<div className='alert alert-warning m-3' key={_}>
            {t('perfTeamsNoEval')}
          </div>)
        )}
      </div>)}
    </div>)));
  },[searchInput, managers, _])

  const search = (
    <div className="mt-2 col-12 col-xs-12 col-md-7 col-lg-5">
      <div className="text-start">
          <div className="input-group">
              <input className="form-control border" type="search" 
                  placeholder={t('teamEvaluationSearchLeader')} onChange={(e) => {
                    setSearchInput(e.target.value);
                    forceUpdate();
                  }}/>
          </div>
      </div>
    </div>)

  const searchComponent = (
    <div className='text-secondary alert alert-light mt-4'>
      {t('perfTeamsTotal')}: {managers.length}
      {search}
      {searchInput.length > 0 && 
        <div className='mt-3'>
          {t('searchResults')}: {managerCards.length}
        </div>}
    </div>
  )

  const handleReturnToAllTeams = () => {
    fetchUsers();
    setSelectedManager(null);
    setManagerCards([]);
    setSearchInput("");
    forceUpdate();
  }

  return (
    <div>
      <div className='row'>
        {props.evaluations && (teamMax != "-infinity" && teamMax != "infinity" && (
          <div className='col-md-6'>
            <div className='alert alert-light' style={{height:"110px"}}>
              <h5 className='fw-light custom-sm-font' style={{marginBottom:"-10px"}}><Icon.InfoCircleFill className='mx-1'/> {t('perfTeamsTeamWith')} <section className='fw-bold' style={{display:'inline'}}>{t('perfTeamsHighestAverage')}: {teamMax} </section></h5>
              <ProfileCard key={_} id={teamMaxId} knob={teamMax}/>
            </div>
          </div>))}
        {props.evaluations && (teamMin != "-infinity" && teamMin != "infinity" && (
          <div className='col-md-6'>
            <div className='alert alert-light' style={{height:"110px"}}>
              <h5 className='fw-light custom-sm-font' style={{marginBottom:"-10px"}}><Icon.InfoCircleFill className='mx-1'/> {t('perfTeamsTeamWith')} <section className='fw-bold' style={{display:'inline'}}>{t('perfTeamsLowestAverage')}: {teamMin}</section></h5>
              <ProfileCard key={_} id={teamMinId} knob={teamMin}/>
            </div>
          </div>
        ))}
      </div>
      {(selectedManager == null) && 
      (<h5 className='fw-light text-secondary'>{t('perfTeamsEvaluationDescription')}</h5>)}
      <div className='p-2'>
        {(selectedManager != null 
        ? ((
          <div>
            <button className='btn btn-sm btn-outline-primary border-0'
              style={{marginBottom:"2px"}}
              onClick={() => handleReturnToAllTeams()}>
                <Icon.ArrowReturnLeft/> {t('allTeams')}
            </button>
            <Team currentUser={selectedManager} for={"allTeams"} evaluations={evaluationsBool}/>
          </div>))
        : (searchComponent))}
        {selectedManager == null && (<div className='row flexrow' style={{maxHeight:"800px", overflow:"scroll"}}>{managerCards} </div>)}
      </div>
    </div>
  );
}