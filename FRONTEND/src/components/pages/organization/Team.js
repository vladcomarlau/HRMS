import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileCard from './ProfileCard';
import * as Icon from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import SearchBarTeam from '../management/teamsMan/SearchBarTeam';
import Table from 'react-bootstrap/Table';
import { Knob } from 'primereact/knob';
import MyPerformance from '../performance/MyPerformance';
import { Slider } from "primereact/slider";
import { FloatLabel } from "primereact/floatlabel";
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';

export default function Team(props) {
    //PROPS 
    //  manager = id
    //  currentUser = obj
    //  edit = boolean
    //  cost = boolean
    //  small = boolean
    //  evaluations = boolean
    const { t } = useTranslation();
    const [updated, setUpdated] = useState(false);
    const [updatedTeam, setUpdatedTeam] = useState(false);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [updatedSelection, setUpdatedSelection] = useState(false);
    const [subordinates, setSubordinates] = useState([]);
    const [subordinatesSalaries, setSubordinatesSalaries] = useState([]);
    const [subordinatesElem, setSubordinatesElem] = useState(null);
    const [currentManager, setCurrentManager] = useState(null);
    const [manager, setManager] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [setTotalTeam] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedEvalUser, setSelectedEvalUser] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState(new Map([]));
    const [canMultiDelete, setCanMultiDelete] = useState(false);
    const [small, setSmall] = useState(false);
    const [selectedUsersCount, setSelectedUsersCount] = useState(0);
    
    const [showEditEvaluationsModal, setShowEditEvaluationsModal] = useState(false);
    const [addDate, setAddDate] = useState("");
    const [addFeedback, setAddFeedback] = useState("");
    const [addCommunication, setAddCommunication] = useState(20);
    const [addEfficiency, setAddEfficiency] = useState(35);
    const [addExpertise, setAddExpertise] = useState(60);
    const [addInitiative, setAddInitiative] = useState(75);
    const [addLeadership, setAddLeadership] = useState(95);

    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        setSmall(props.small);
        fetchCurrentUser();
        switch(props.for) {
            case "yourTeam":
                if(props.currentUser != null && props.currentUser.manager != null){
                    changeTeam(props.currentUser.manager)
                }
                break;
            case "subordinates":
                if(props.currentUser != null){
                    changeTeam(props.currentUser);
                }
                break;
            case "allTeams":
                fetchUser(props.currentUser.id);
                break;
            default:
                fetchCurrentUser();
                fetchUser(props.manager);
        }
    },[])

  const getAiFeedback = () => {
    generateResponse(`Comunicare = ${addCommunication}, Eficienta = ${addEfficiency}, Expertiza = ${addExpertise}, Initiativa = ${addInitiative}, Leadership = ${addLeadership}`);
  }

  const generateResponse = async () => {
    setAddFeedback(t('perfAccountsGenerateFeedback'));

    try {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                method: "GET",
                url: `http://localhost:8082/openai/${addCommunication}/${addEfficiency}/${addExpertise}/${addInitiative}/${addLeadership}`
            }).then((response) => {
                setAddFeedback(response.data.choices[0].message.content);
            }).catch((error) => {
                console.log(error.message);
            })
    } catch (error) {
      console.error(t('errorOccurred'), error);
    }};

    const handleCloseAddModal = () => setShowAddModal(false);
    const handleCloseChangeModal = () => setShowChangeModal(false);

    const handleOpenAdd = () => {
        setSelectedUser(null);
        setShowAddModal(true);
    }

    const handleOpenChange = () => {
        setSelectedUser(null);
        setShowChangeModal(true);
    }

    const calculateTotalTeam = () => {
        let totalValueTeam = 0;
        for(let j = 0; j < subordinates.length; j++) {
            let currentSalary = subordinates[j].salaries[subordinates[j].salaries.length-1];
            if(currentSalary != undefined
            && currentSalary.total != undefined) {
                totalValueTeam += currentSalary.total;
            }
        }

        let currentSalaryManager = manager.salaries[manager.salaries.length-1];
        if(currentSalaryManager != null
        && currentSalaryManager.total != null)
        {
            totalValueTeam += currentSalaryManager.total;
        }
        setTotalTeam(totalValueTeam);
        return(totalValueTeam);
    }

    const handleChange = () => {
        if(selectedUser == null) {
            alert(t('teamSelectNewManager'));
        } else {
            axios.request({
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    method: "PUT",
                    url: `http://localhost:8082/users/${selectedUser.id}/${currentManager.id}`
                }).then((res) => {
                    if(res.data != null) {
                        alert(JSON.stringify(res.data).slice(1,res.data.length+1));
                        setUpdated(!updated);
                        window.dispatchEvent(new Event("refreshAllTeams"));
                    }
                })
        }
        setShowChangeModal(false);
    }

    const handleAdd = () => {
        if(selectedUser == null) {
            alert(t('teamSelectAccount'));
        } else {
            axios.request({
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    method: "POST",
                    url: `http://localhost:8082/users/${currentManager.id}/${selectedUser.id}`
                }).then((res) => {
                    if(res.data != null) {
                        fetchUser(currentManager.id);
                        alert(JSON.stringify(res.data).slice(1,res.data.length+1));
                        setUpdated(!updated);
                        setUpdatedTeam(!updatedTeam);
                    }
                })
        }
        setShowAddModal(false);
    }

    const fetchSalaries = (id) => {
        if(props.cost) {
            axios.request({
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    method: "GET",
                    url: `http://localhost:8082/salaries/team/${id}`
                }).then((responseAuth) => {
                    setSubordinatesSalaries(responseAuth.data);
                    setUpdated(!updated);
                }).catch((error) => {
                    console.log(error.message);
                })
            calculateTotalTeam();
        }
    }

    const requestHierarchy = (url, id) => {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                method: "GET",
                url: url
        }).then((responseAuth) => {
            if(responseAuth.data != null
            && responseAuth.data.subordinates != null) {
                setSubordinatesElem([]);
                setSubordinates(responseAuth.data.subordinates);
                setCurrentManager(responseAuth.data);
                window.dispatchEvent(new Event("refreshAvatar"));
                if(responseAuth.data.manager!=null) {
                    setManager(responseAuth.data.manager);
                } else {
                    setManager(null);
                }
                
                fetchSalaries(id);

                setUpdated(!updated); 
            }
        }).catch((error) => {
            console.log(error.message);
        })
    }

    const fetchUser = (id) => {
        if(props.evaluations) {
            requestHierarchy(`http://localhost:8082/evaluations/hierarchy/${id}`, id);
        } else {
            requestHierarchy(`http://localhost:8082/users/${id}/hierarchy`, id);
        }
    }

    const fetchCurrentUser = () => {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/users/jwt`
          }).then((responseAuth) => {
            setCurrentUser(responseAuth.data);
          }).catch((error) => {
            console.log(error.message);
            window.location.reload();
        })
    }

    const formatCurrency = (value) => {
        return value.toLocaleString('ro-RO', { style: 'currency', currency: 'ron' });
      };
    
    const changeTeam = (e) => {
        if(e != null) {
            selectedUsers.clear();
            setSelectedUsersCount(0);
            setCanMultiDelete(false);
            setCurrentManager(null);
            setManager(null);
            setSubordinates([]);
            setSubordinatesElem(null);
            setCurrentTeam(e.id);
            fetchUser(e.id);
        }
    }

    const calculateMinMaxEvaluation = (e) => {
        let criterias = [t('perfCommunication'),t('perfEfficiency'), t('perfExpertise'), t('perfInitiative'), t('perfLeadership')];
        let evalMax = 0;
        let maxCriteria = "";
        let evalMin = 0;
        let minCriteria = "";
        if(e != null) {
            let arrVal = [e.communication, e.efficiency, e.expertise, e.initiative, e.leadership];
            evalMax = Math.max(...arrVal);
            maxCriteria = criterias[arrVal.indexOf(evalMax)];
            evalMin = Math.min(...arrVal);
            minCriteria = criterias[arrVal.indexOf(evalMin)];
        }
        return [(evalMax*100).toFixed(0), maxCriteria, (evalMin*100).toFixed(0), minCriteria];
    }

    const handleShowEditEvalModal = (user) => {
        setSelectedEvalUser(user);
        setShowEditEvaluationsModal(true);
    }

    const profilePanel = (user, index, right) => {
        if(user != null){
            return(<div className='col-6 border-bottom border-end p-1'>
                {(props.edit && ( <div className='text-end m-2 mb-0'>
                        <small className='mx-2 text-secondary'>{t('remove')}</small>
                        <input className="form-check-input border-primary"
                            type="checkbox" value="" id="flexCheckChecked"
                            onChange={(event) => handleSelection(event, user)}/>
                    </div>))}
                <ProfileCard id={user.id} count = {user.subordinatesCount} small={small}/>
                {props.cost && (
                    <div className='text-start alert alert-light m-3'>
                        {t('currentSalaryTitle')}: <div className='fw-bold'>{((subordinatesSalaries.length>0) && (subordinatesSalaries[index*2+right]) != undefined)? formatCurrency(subordinatesSalaries[index*2+right].total):("-")}</div>
                    </div>
                )}<br></br>
                {props.evaluations && (user.currentEvaluation != undefined ? (
                    <>
                        <div style={{margin:"-50px 0px 10px 13px"}} className='custom-sm-font text-secondary text-start' >{t('perfLastEval')}</div>
                        <div key={_}  className='row mb-3'>
                            <div className='col-4' style={{marginTop:"0px"}} key={updated}>
                                <Knob key={_} value={(user.currentEvaluation.average*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((user.currentEvaluation.average*100).toFixed(0))[1]} readOnly/>
                                <div style={{margin:"-10px 0px 10px 0px"}}>{grade((user.currentEvaluation.average*100).toFixed(0))[0]}</div>
                            </div>
                            <div className='col-md-8'>
                                <div className='row'>
                                    
                                    <div className = "col-md-4">
                                        <div className='custom-sm-font'><small>{calculateMinMaxEvaluation(user.currentEvaluation)[3]}</small></div>
                                        <Knob value={calculateMinMaxEvaluation(user.currentEvaluation)[2]} size={50} valueTemplate={'{value}'} valueColor={grade(calculateMinMaxEvaluation(user.currentEvaluation)[2])[1]} textColor='#000000' readOnly/>
                                        <div className='custom-sm-font'><small>{grade(calculateMinMaxEvaluation(user.currentEvaluation)[2])[0]}</small></div>
                                    </div>

                                    <div className = "col-md-4">
                                        <div className='custom-sm-font'><small>{calculateMinMaxEvaluation(user.currentEvaluation)[1]}</small></div>
                                        <Knob value={calculateMinMaxEvaluation(user.currentEvaluation)[0]} size={50} valueTemplate={'{value}'} valueColor={grade(calculateMinMaxEvaluation(user.currentEvaluation)[0])[1]} textColor='#000000' readOnly/>
                                        <div className='custom-sm-font'><small>{grade(calculateMinMaxEvaluation(user.currentEvaluation)[0])[0]}</small></div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>   
                    </>
                ):
                (<div className='alert alert-warning me-2' style={{marginTop:"-40px"}}>{t('perfAccountsNotEvaluated')}</div>))}

                { props.evaluations && user != undefined && (
                    <button className='btn btn-sm btn-outline-primary'
                        style={{margin:"0px 5px 10px 0px"}}
                        onClick={()=> handleShowEditEvalModal(user)}><Icon.BarChart/> {t('teamManagePerformance')}</button>
                )}

                {user.hasSubordinates && (
                    <button className='btn btn-sm btn-outline-secondary'
                        style={{margin:"0px 0px 10px 0px"}}
                        onClick={()=>changeTeam(user)}><Icon.PeopleFill/> {t('teamViewTeam')}</button>
                )}
            </div>)
        }
    }

    useEffect(() => {
        let subordinatesElems = 
            subordinates.reduce(function (rows, key, index) { 
                return (index % 2 == 0 ? rows.push([key]) 
                : rows[rows.length-1].push(key)) && rows;
            }, []).map((e, index)=>
            (e != null) && (
                <div className='row m-0 p-0'>
                    {profilePanel(e[0], index, 0)}
                    {profilePanel(e[1], index, 1)}
                </div>
            )); 
        setSubordinatesElem(subordinatesElems);
    },[currentManager, subordinatesSalaries])

    const selectedUserCallback = (user) => {
        setSelectedUser(user);
    }

    const handleSelection = (e, user) => { 
        if (e.target.checked) {
            selectedUsers.set(user.id);
        } else {
            selectedUsers.delete(user.id);
        }
        if(selectedUsers.size > 0 ) {
            setCanMultiDelete(true);
        } else {
            setCanMultiDelete(false);
        }
        setUpdatedSelection(!updatedSelection);
        setSelectedUsersCount(selectedUsers.size);
    }

    const average = (e) => {
        let val = 0;
        for (let i = 0; i < e.length; i++) {
          val += e[i];
        }
        return val/e.length;
      }    

    const handleMultiDelete = () => {
        if(selectedUsers.size > 0 && currentManager != null) {
            if(selectedUsers.size == currentManager.subordinates.length) {
                handleAllDelete();
            } else {
                let tempArr = Array.from(selectedUsers);
                if (window.confirm(t('teamConfirmAccountsRemove'))) {
                    for(let i = 0; i < selectedUsers.size; i++) {
                        axios.request({
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                                },
                                method: "DELETE",
                                url: `http://localhost:8082/users/${currentManager.id}/${tempArr[i][0]}`
                            }).catch((error) => {
                                console.log(error.message);
                            })
                    }
                    selectedUsers.clear();
                    alert(t('teamAccountsRemoveSuccess'));
                } else {
                    alert(t('teamAccountsRemoveCanceled'));
                }
            }
            
        }
        setUpdated(!updated);
        setUpdatedTeam(!updatedTeam);
        setUpdatedSelection(!updatedSelection);
        window.dispatchEvent(new Event("refreshAllTeams"));
    }

    const handleAllDelete = () => {
        if(currentManager.subordinates.length > 0 && currentManager != null) {
            if (window.confirm(t('teamConfirmAccountsRemoveAll'))) {
                for(let i = 0; i < currentManager.subordinates.length; i++) {
                    axios.request({
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                            },
                            method: "DELETE",
                            url: `http://localhost:8082/users/${currentManager.id}/${currentManager.subordinates[i].id}`
                        }).catch((error) => {
                            console.log(error.message);
                        })
                }
                setUpdated(!updated);
                setUpdatedTeam(!updatedTeam);
                alert(t('teamRemovalSuccess'));
            } else {
                alert(t('teamRemovalCanceled'));
            }
            window.dispatchEvent(new Event("refreshAllTeams"));
        }
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

    const handleAddEvaluation = () => {
        if(window.confirm(t('perfAccountsConfirmSend'))) {
          if(!(!addDate || addDate.length == 0 || addDate == null)) {
            const offset = addDate.getTimezoneOffset();
            let yourDate = new Date(addDate.getTime() - (offset*60*1000));
            let parsedDate = yourDate.toISOString().split('T')[0]
            let dataFields = {
                "evaluationDate": parsedDate,
                "user_id": selectedEvalUser.id,
                "lastNameUser": selectedEvalUser.lastName,
                "firstNameUser": selectedEvalUser.firstName,
                "managerName": currentUser!=null ? currentUser.firstName + " " + currentUser.lastName : "",
                "expertise": addExpertise/100,
                "communication": addCommunication/100,
                "initiative": addInitiative/100,
                "leadership": addLeadership/100,
                "efficiency": addEfficiency/100,
                "feedback": addFeedback
            }

            axios.request({
              headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`
              },
              data: dataFields,
              method: "POST",
              url: `http://localhost:8082/evaluations/${selectedEvalUser.id}`
            }).then((response) => {
                fetchUser(currentManager.id);
                setShowEditEvaluationsModal(false);
            }).catch(function (error) {
              alert(t('errorEvaluationSend'));
              console.log(error.message);
              window.location.reload();
            });
          } else {
            alert(t('perfAccountsDateRequired'));
          }
        } else {
          window.alert(t('perfAccountsCancelSend'));
        }
    }

    const handleCloseEditEvaluationsModal = () => {
        fetchUser(currentManager.id);
        setShowEditEvaluationsModal(false);
        setUpdated(!updated);
        forceUpdate();
    }

    const addEvaluationForm = (
        <div key={updated} className='alert alert-light pb-4 px-4 mb-5 mt-4'>
          <div className='fw-lighter text-start my-2 fs-4'><Icon.PlusCircle size={20} style={{margin:'0px 5px 3px 3px'}}/>{t('perfAccountsAddEvaluation')}</div>
          <div>{selectedUser != null && <ProfileCard id={selectedUser.id}/>}</div>
    
          <div className='row'>
            <div className='col-md-5 pt-3 fw-bold text-primary'>
                {t('perfCommunication')} {grade(addCommunication)[0]}
            </div>
            <div className='col-md-7'>
              <div className='mb-1 fw-bold'>{addCommunication}</div>
              <Slider value={addCommunication} onChange={(e) => setAddCommunication(e.value)} className="w-full" />
            </div>
          </div>
    
          <div className='row'>
            <div className='col-md-5 pt-3 fw-bold text-primary'>
                {t('perfEfficiency')} {grade(addEfficiency)[0]}
            </div>
            <div className='col-md-7'>
            <div className='mb-1 fw-bold'>{addEfficiency}</div>
              <Slider value={addEfficiency} onChange={(e) => setAddEfficiency(e.value)} className="w-full" />
            </div>
          </div>
    
          <div className='row'>
            <div className='col-md-5 pt-3 fw-bold text-primary'>
                {t('perfExpertise')} {grade(addExpertise)[0]}
            </div>
            <div className='col-md-7'>
              <div className='mb-1 fw-bold'>{addExpertise}</div>
              <Slider value={addExpertise} onChange={(e) => setAddExpertise(e.value)} className="w-full" />
            </div>
          </div>
    
          <div className='row'>
            <div className='col-md-5 pt-3 fw-bold text-primary'>
                {t('perfInitiative')} {grade(addInitiative)[0]}
            </div>
            <div className='col-md-7'>
              <div className='mb-1 fw-bold'>{addInitiative}</div>
              <Slider value={addInitiative} onChange={(e) => setAddInitiative(e.value)} className="w-full" />
            </div>
          </div>
    
          <div className='row'>
            <div className='col-md-5 pt-3 fw-bold text-primary'>
                {t('perfLeadership')} {grade(addLeadership)[0]}
            </div>
            <div className='col-md-7'>
              <div className='mb-1 fw-bold'>{addLeadership}</div>
              <Slider value={addLeadership} onChange={(e) => setAddLeadership(e.value)} className="w-full" />
            </div>
          </div>
    
          <div className='row'>
            <div className='mt-3 fw-bold rounded border-primary-subtle'>
              {t('average')}: {average([addCommunication, addEfficiency, addExpertise, addInitiative, addLeadership]).toFixed(0)}{grade(average([addCommunication, addEfficiency, addExpertise, addInitiative, addLeadership]))[0]}
            </div>
          </div>
    
          <div className='d-flex justify-content-end'>
            <div className='btn btn-small btn-primary' onClick={() => getAiFeedback()}><Icon.Magic size={20}/> {t('perfAccountsGenerateFeedbackButton')}</div>
          </div>
    
          <FloatLabel className="mt-3">
            <InputTextarea id="feedback" className='col-12' rows={10} value={addFeedback} onChange={(e) => setAddFeedback(e.target.value)}/>
            <label htmlFor="feedback">{t('perfFeedback')}</label>
          </FloatLabel>
    
          <FloatLabel className="mt-4 mb-4">
            <Calendar inputId="evaluationDate" value={addDate} onChange={(e) => setAddDate(e.value)} touchUI/>
            <label htmlFor="evaluationDate">{t('perfEvaluationDate')}</label>
          </FloatLabel>
    
          <Button onClick={() => handleAddEvaluation()}>{t('perfAccountsSendEvaluation')}</Button>
        </div>
    )

    return (
        <div className='p-0 text-center'>
            {(manager != null &&
            (<div>
                <div className='d-flex justify-content-center'>
                    <div style={{width:"300px", margin:"5px"}}>
                        <div className='row mb-4'>
                            {(currentManager != null && (
                                <h6 className='fw-lighter'>{t('teamManagerOf')} {currentManager.firstName + " " + currentManager.lastName}</h6>
                            ))}
                            {(manager != null && (
                                <ProfileCard border id={manager.id} className="border-0 bg-transparent rounded-0" count={manager.subordinatesCount} small={small}/>
                            ))}
                            
                        </div>
                        {( <button className='btn btn-sm btn-outline-secondary'
                            style={{marginTop:"-80px"}}
                            onClick={()=>changeTeam(manager)}>{t('teamViewTeam')}</button>
                        )}
                    </div>
                </div>
                {(currentManager != null && currentUser != null) 
                    && props.for != "allTeams"
                    && !(currentUser.manager.id == currentManager.id)
                    && ((currentUser != currentManager.id) && (
                    <button className='btn btn-sm btn-outline-primary border-0 float-start' 
                        onClick={()=>changeTeam(currentUser.manager)}><Icon.ArrowReturnLeft/> {t('teamYourTeam')}</button>))}
                <div className="vl"></div>
            </div>))}
            <div key={updatedTeam} className={manager != null ? 'alert alert-light' : 'alert alert-light'}>
                {(currentManager != null && currentUser != null && currentUser.manager!=null) && ((currentUser.manager.id == currentManager.id) && 
                    (<div className='badge text-bg-warning' >{t('organizationMenuBarDirectColleagues')}</div>))}
                <br></br><br></br>
                
                {(props.edit && 
                (<div key={updatedSelection}  className='text-start alert alert-light bg-white' style={{margin:"-50px 0px 10px 0px"}} >
                    <button className='btn btn-sm btn-outline-primary m-1 border-0'
                            onClick={() => handleOpenAdd()}>
                                <Icon.PersonPlusFill size={23} style={{margin:"-2px 8px 0px 0px"}}/>
                                    {t('teamAddMember')}</button>
                    <button className='btn btn-sm btn-outline-primary m-1 border-0'
                        onClick={() => handleOpenChange()}>
                            <Icon.ArrowRepeat size={23} style={{margin:"-2px 8px 0px 0px"}}/>
                                {t('teamChangeManager')}</button>
                    <button
                        onClick={() => handleMultiDelete()}
                        className={canMultiDelete ?
                        'btn btn-sm btn-outline-danger m-1' :
                        'btn btn-sm btn-outline-secondary m-1 border-0 disabled'}>
                            <Icon.PersonDash size={23} style={{margin:"-2px 8px 0px 0px"}}/>
                                {t('teamRemoveMember')} {selectedUsersCount > 0 && (selectedUsersCount)} {t('teamMembers')}</button>
                    <button
                        onClick={() => handleAllDelete()}
                        className={'btn btn-sm btn-outline-danger m-1 border-0 float-end'}>
                            <Icon.Trash size={20} style={{margin:"-2px 8px 0px 0px"}}/>
                                {t('teamRemoveAllMembers')}</button>
                </div>))}

                <h5 className='fw-light text-secondary'>{t('teamManager')}</h5>

                <div className='d-flex justify-content-center m-0'>
                    <div style={{width:"300px", margin:"5px"}}>
                        {(currentManager != null && (
                            <ProfileCard border id={currentManager.id} count={currentManager.subordinatesCount} small={small}/>
                        ))}
                    </div>
                </div>
                <div className=''><div className="vl"></div></div>
                {(currentUser!= null && currentManager!= null && currentManager.id === currentUser.id) 
                    && (<div className='badge text-bg-primary my-4'>{t('teamYourSubordinates')}</div>)}
                <h6 className='fw-light text-secondary'>{t('teamMembersOfTeam')} {currentManager != null && ("("+ currentManager.subordinatesCount)+")"}</h6>
                <div className='text-center'>
                    {subordinatesElem != null && subordinatesElem}
                </div>
            </div>

            <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg">
                <Modal.Header closeButton>
                <Modal.Title>{t('teamAddMember')}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <div className='p-3'>
                        {(currentManager != null && 
                            (<ul className='nav nav-pills nav-fill'><SearchBarTeam managerId={currentManager} selectedUserCallback={selectedUserCallback}/></ul>))}

                        {(selectedUser != null) && 
                        <div className='alert alert-warning'>
                            <div className='mb-3'>{t('teamAddMemberDescriptionAlert')}</div>
                                <Table striped bordered hover size="sm" responsive>
                                <tbody>
                                    <tr>
                                        <td>{t('id')}</td>
                                        <td>{selectedUser.id}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('email')}</td>
                                        <td>{selectedUser.email}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('fullName')}</td>
                                        <td>{selectedUser.firstName + " " + selectedUser.lastName}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('jobTitle')}</td>
                                        <td>{selectedUser.jobTitle}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('profileManagerTitle')}</td>
                                        <td>{selectedUser.manager != null && (selectedUser.manager.firstName + " " + selectedUser.manager.lastName)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseAddModal}>
                    {t('close')}
                </Button>
                <Button variant="primary" onClick={handleAdd}>
                    {t('add')}
                </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showChangeModal} onHide={handleCloseChangeModal} size="lg">
                <Modal.Header closeButton>
                <Modal.Title>{t('teamChangeManager')}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <div className='p-3'>
                        {(currentManager != null && 
                            (<ul className='nav nav-pills nav-fill'><SearchBarTeam managerId={currentManager} selectedUserCallback={selectedUserCallback}/></ul>))}

                        {(selectedUser != null) && 
                        <div className='alert alert-warning'>
                            <div className='mb-3'>{t('teamAddManagerDescriptionAlert')}</div>
                                <Table striped bordered hover size="sm" responsive>
                                <tbody>
                                    <tr>
                                        <td>{t('id')}</td>
                                        <td>{selectedUser.id}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('email')}</td>
                                        <td>{selectedUser.email}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('fullName')}</td>
                                        <td>{selectedUser.firstName + " " + selectedUser.lastName}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('jobTitle')}</td>
                                        <td>{selectedUser.jobTitle}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('profileManagerTitle')}</td>
                                        <td>{selectedUser.manager != null && (selectedUser.manager.firstName + " " + selectedUser.manager.lastName)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseChangeModal}>
                    {t('close')}
                </Button>
                <Button variant="primary" onClick={handleChange}>
                    {t('modify')}
                </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={showEditEvaluationsModal} onHide={handleCloseEditEvaluationsModal} size="xl" fullscreen>
                <Modal.Header closeButton>
                <Modal.Title>{t('perfAccountsEditEvaluationsModalTitle')} {selectedEvalUser!=null && (selectedEvalUser.firstName + " " + selectedEvalUser.lastName)}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <div className='px-5 pt-2'>
                    <Tabs id="controlled-tab-example" defaultActiveKey={"evaluations"} className="mb-3" fill>
                        <Tab eventKey="evaluations" title={t('evaluations')}>
                            <h3 className='fw-lighter'><Icon.PersonFill size={20} style={{marginBottom:'3px'}}/> {t('selectedAccount')}</h3><hr/>
                            <div className='alert alert-light p-2 overflow-auto'>
                                {selectedEvalUser != null && (
                                <>
                                <table className='table table-lg table-hover'>
                                    <thead>
                                    <tr className='text-start' style={{whiteSpace: "nowrap"}}>
                                        <th scope='col'>{t('id')}</th>
                                        <th scope='col'>{t('email')}</th>
                                        <th scope='col'>{t('firstName')}</th>
                                        <th scope='col'>{t('lastName')}</th>
                                        <th scope='col'>{t('jobTitle')}</th>
                                        <th scope='col'>{t('profileManagerTitle')}</th>
                                        <th scope='col'>{t('hasTeam')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>{selectedEvalUser != null && (
                                    <tr key={updated} style={{whiteSpace: "nowrap"}}>
                                        <th scope='row'><small>{selectedEvalUser.id}</small></th>
                                        <td><small>{selectedEvalUser.email}</small></td>
                                        <td><small>{selectedEvalUser.firstName}</small></td>
                                        <td><small>{selectedEvalUser.lastName}</small></td>
                                        <td><small>{selectedEvalUser.jobTitle}</small></td>
                                        <td><small>{selectedEvalUser.manager != null ?
                                        (selectedEvalUser.manager.firstName + " " + selectedEvalUser.manager.lastName) :
                                        "-"}</small></td>
                                        <td><small>{(selectedEvalUser.subordinatesCount > 0) ? 
                                            <Icon.PeopleFill size={20}/> 
                                            : "-"}</small></td>
                                    </tr>
                                    )}</tbody>
                                </table>
                                </>
                                )}
                            </div>
                            <div className='pb-1'>
                                {selectedEvalUser != null && (selectedEvalUser.currentEvaluation == null ? 
                                (<div className='alert alert-warning'>{t('perfAccountsNoEval')}</div> )
                                : (<MyPerformance id={selectedEvalUser.id} edit/>))}
                            </div>
                        </Tab>
                        <Tab eventKey="addEvaluation" title={t('perfAccountsAddEvaluation')}>
                            {addEvaluationForm}
                        </Tab>
                    </Tabs>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseEditEvaluationsModal}>{t('close')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}