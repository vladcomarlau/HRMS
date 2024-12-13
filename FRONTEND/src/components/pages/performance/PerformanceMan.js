import * as React from 'react';
import * as Icon from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import MyPerformance from './MyPerformance';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from "primereact/floatlabel";
import { Slider } from "primereact/slider";
import ProfileCard from '../organization/ProfileCard';
import { Calendar } from 'primereact/calendar';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Chart } from 'primereact/chart';
import { useTranslation } from 'react-i18next';

export default function PerformanceMan(props) {
  // props
  // currentUser = user
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [actualEvaluations, setActualEvaluations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser] = useState(props.currentUser);

  const [addDate, setAddDate] = useState("");
  const [addFeedback, setAddFeedback] = useState("");
  const [addCommunication, setAddCommunication] = useState(20);
  const [addEfficiency, setAddEfficiency] = useState(35);
  const [addExpertise, setAddExpertise] = useState(60);
  const [addInitiative, setAddInitiative] = useState(75);
  const [addLeadership, setAddLeadership] = useState(95);

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
      }
  };

  useEffect(() => {
    fetchEvaluations();
  },[])
  
  const fetchEvaluations = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/evaluations/accounts`
    }).then((responseAuth) => {
      setEvaluations(responseAuth.data);
    }).catch((error) => {
      console.log(error.message);
    })
  }

  const dataTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.evaluationDate!= undefined) {
      return rowData.currentEvaluation.evaluationDate;
    } else {
      return (<div className='text-danger'>{t('perfAccountsNotEvaluated')}</div>);
    }
  };

  const managerTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.managerName!= undefined && rowData.currentEvaluation.managerName.length > 0) {
      return rowData.currentEvaluation.managerName;
    } else {
      return "-";;
    }
  };

  const averageTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.average!= undefined) {
      return `${(rowData.currentEvaluation.average*100).toFixed(0)}`;
    } else {
      return "-";
    }
  };

  const communicationTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.communication!= undefined) {
      return `${(rowData.currentEvaluation.communication*100).toFixed(0)}`;
    } else {
      return "-";
    }
  };

  const efficiencyTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.efficiency!= undefined) {
      return `${(rowData.currentEvaluation.efficiency*100).toFixed(0)}`;
    } else {
      return "-";
    }
  };

  const expertiseTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.expertise!= undefined) {
      return `${(rowData.currentEvaluation.expertise*100).toFixed(0)}`;
    } else {
      return "-";
    }
  };

  const initiativeTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.initiative!= undefined) {
      return `${(rowData.currentEvaluation.initiative*100).toFixed(0)}`;
    } else {
      return "-";
    }
  };

  const leadershipTemp = (rowData) => {
    if (rowData.currentEvaluation != undefined && rowData.currentEvaluation.leadership!= undefined) {
      return `${(rowData.currentEvaluation.leadership*100).toFixed(0)}`;
    } else {
      return "-";
    }
  };

  const editTemplate = (row) => {
    return <small className='btn btn-sm btn-outline-dark border-0 d-flex justify-content-center'
      style={{marginRight:"-7px"}} onClick={() => handleOpenEditModal(row)}><Icon.PenFill size={15}/></small> 
  };

  const handleOpenEditModal = (row) => {
    setAddFeedback("");
    setSelectedUser(row);
    setShowEditModal(true);
  }
  
  const handleCloseEditModal = (row) => {
    setShowEditModal(false);
  }

  const handleSearchInput = (event) => {
    setSearchInput(event.target.value);
  }

  useEffect(() => {
    if ( evaluations != null) {
      let evals = evaluations.map(a => {if(a.currentEvaluation != null ) {
          return a.currentEvaluation.average
        }})
      .filter(function( element ) {
        return element !== undefined;
      });

      const intervals = [[0.0, 0.10], [0.11, 0.20], [0.21, 0.30], [0.31, 0.40], [0.41, 0.50], [0.51, 0.60], [0.61, 0.70], [0.71, 0.80], [0.81, 0.90], [0.91, 1.0]];
      let countIntervals = [];

      if(evals.length > 0) {
        for(let i = 0; i < intervals.length; i++) { 
          countIntervals[i] = (evals.filter(function( element ) {
            return (element.toFixed(2) >= intervals[i][0] && element.toFixed(2) <= intervals[i][1]);
          })).length
        }
      }    
 
      setActualEvaluations({
        labels: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'],
        datasets: [
            {
                label: t('perfAccountsOverviewLegend'),
                data: countIntervals
            }
        ]
      });

      setFilteredEvaluations(evaluations.filter(searchFilter)
      .map((row, index) => (
        row != null
        &&(row)
      )));
      setUpdated(!updated);
    }
  },[evaluations, searchInput])

  const search = (
    <div className="mt-2 col-12 col-xs-12 col-md-7 col-lg-5">
      <div className="text-start">
          <div className="input-group">
              <input className="form-control border" type="search" 
                  placeholder={t('searchAccountPH')} onChange={handleSearchInput}/>
          </div>
      </div>
    </div>
  )

  const searchFilter = (oldRow) => {
    if(oldRow != null && searchInput.length > 0){
      const {manager, correlationElements, currentEvaluation, avatar, subordinates, leaves, ...row} = oldRow;
      console.log(row);
      let matchesName = (row.firstName + " " + row.lastName)
          .toLowerCase().includes(searchInput.toLowerCase());
      let matchesNameReversed = (row.lastName + " " + row.firstName)
          .toLowerCase().includes(searchInput.toLowerCase());
      return JSON.stringify(row).toLowerCase().includes(searchInput.toLowerCase())
          || matchesName
          || matchesNameReversed;
    } else{
        return true;
    }
  }

  const handleAddEvaluation = () => {
    if(window.confirm(t('perfAccountsConfirmSend'))) {
      if(!(!addDate || addDate.length == 0 || addDate == null)) {
        const offset = addDate.getTimezoneOffset();
        let yourDate = new Date(addDate.getTime() - (offset*60*1000));
        let parsedDate = yourDate.toISOString().split('T')[0]
        
        axios.request({
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          data: {
              "evaluationDate": parsedDate,
              "managerName": currentUser!=null ? currentUser.firstName + " " + currentUser.lastName : "",
              "communication": addCommunication/100,
              "expertise": addExpertise/100,
              "initiative": addInitiative/100,
              "leadership": addLeadership/100,
              "efficiency": addEfficiency/100,
              "feedback": addFeedback
            },
          method: "POST",
          url: `http://localhost:8082/evaluations/${selectedUser.id}`
        }).then((response) => {
          fetchEvaluations();
          setShowEditModal(false);
          setUpdated(!updated);
        }).catch(function (error) {
          alert(t('perfAccountsSendError'))
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

  const average = (e) => {
    let val = 0;
    for (let i = 0; i < e.length; i++) {
      val += e[i];
    }
    return val/e.length;
  }

  const grade = (val) => {
    let grade = (<div className='badge shadow mx-2'>{t('perfNoGrade')}</div>);
    switch (true) {
      case (val < 35):
        grade = <div className='badge shadow mx-2 bg-danger'>{t('perfUnsatisfying')}</div>;
        break;
      case (val < 50):
        grade = <div className='badge shadow mx-2 bg-warning'>{t('perfSatisfying')}</div>;
        break;
      case (val < 65):
        grade = (<div className='badge shadow mx-2 bg-success'>{t('perfGood')}</div>);
        break;
      case (val < 90):
        grade = <div className='badge shadow mx-2 bg-success'>{t('perfVeryGood')}</div>;
        break;
      case (val <= 100):
        grade = <div className='badge shadow mx-2 bg-success'>{t('perfExceptional')}</div>;
        break;
    }
    return grade;
  }

  const addEvaluationForm = (
    <div key={updated} className='alert alert-light pb-4 px-4 mb-5 mt-4'>
      <div className='fw-lighter text-start my-2 fs-4'><Icon.PlusCircle size={20} style={{margin:'0px 5px 3px 3px'}}/>{t('perfAccountsAddTitle')}</div>
      <div>{selectedUser != null && <ProfileCard id={selectedUser.id}/>}</div>

      <div className='row'>
        <div className='col-md-5 pt-3 fw-bold text-primary'>
        {t('perfCommunication')} {grade(addCommunication)}
        </div>
        <div className='col-md-7'>
          <div className='mb-1 fw-bold'>{addCommunication}</div>
          <Slider value={addCommunication} onChange={(e) => setAddCommunication(e.value)} className="w-full" />
        </div>
      </div>

      <div className='row'>
        <div className='col-md-5 pt-3 fw-bold text-primary'>
        {t('perfEfficiency')} {grade(addEfficiency)}
        </div>
        <div className='col-md-7'>
        <div className='mb-1 fw-bold'>{addEfficiency}</div>
          <Slider value={addEfficiency} onChange={(e) => setAddEfficiency(e.value)} className="w-full" />
        </div>
      </div>

      <div className='row'>
        <div className='col-md-5 pt-3 fw-bold text-primary'>
        {t('perfExpertise')} {grade(addExpertise)}
        </div>
        <div className='col-md-7'>
          <div className='mb-1 fw-bold'>{addExpertise}</div>
          <Slider value={addExpertise} onChange={(e) => setAddExpertise(e.value)} className="w-full" />
        </div>
      </div>

      <div className='row'>
        <div className='col-md-5 pt-3 fw-bold text-primary'>
        {t('perfInitiative')} {grade(addInitiative)}
        </div>
        <div className='col-md-7'>
          <div className='mb-1 fw-bold'>{addInitiative}</div>
          <Slider value={addInitiative} onChange={(e) => setAddInitiative(e.value)} className="w-full" />
        </div>
      </div>

      <div className='row'>
        <div className='col-md-5 pt-3 fw-bold text-primary'>
        {t('perfLeadership')} {grade(addLeadership)}
        </div>
        <div className='col-md-7'>
          <div className='mb-1 fw-bold'>{addLeadership}</div>
          <Slider value={addLeadership} onChange={(e) => setAddLeadership(e.value)} className="w-full" />
        </div>
      </div>

      <div className='row'>
        <div className='mt-3 fw-bold rounded border-primary-subtle'>
        {t('average')}: {average([addCommunication, addEfficiency, addExpertise, addInitiative, addLeadership]).toFixed(0)}{grade(average([addCommunication, addEfficiency, addExpertise, addInitiative, addLeadership]))}
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
        <label htmlFor="evaluationDate">{t('evaluationDate')}</label>
      </FloatLabel>

      <Button onClick={() => handleAddEvaluation()}>{t('perfAccountsSendEvaluation')}</Button>
    </div>
  )

  const headerGroup = (
    <ColumnGroup>
        <Row>
          <Column header="" colSpan={4} />
          <Column header={t('perfLastEval')} colSpan={7}/>
        </Row>
        <Row>
        <Column field="id" header={t('id')} style={{ minWidth: '30px' }} sortable frozen ></Column>
                <Column field="firstName" header={t('firstName')} style={{ minWidth: '150px' }} sortable frozen ></Column>
                <Column field="lastName" header={t('lastName')} style={{ minWidth: '150px' }} sortable frozen></Column>
                <Column header="" style={{ minWidth: '30px' }} body={editTemplate} frozen></Column>
                <Column field="currentEvaluation.evaluationDate" header={t('perfEvaluationDate')} body={dataTemp} style={{ minWidth: '130px' }}  sortable></Column>
                <Column field="currentEvaluation.managerName" header={t('perfEvaluator')} body={managerTemp} style={{ minWidth: '130px' }} sortable></Column>
                <Column field="currentEvaluation.average" header={t('average')} body={averageTemp} style={{ minWidth: '150px' }}  sortable></Column>
                <Column field="currentEvaluation.communication" header={t('perfCommunication')} body={communicationTemp} style={{ minWidth: '100px' }} sortable></Column>
                <Column field="currentEvaluation.efficiency" header={t('perfEfficiency')} body={efficiencyTemp} style={{ minWidth: '100px' }} sortable></Column>
                <Column field="currentEvaluation.expertise" header={t('perfExpertise')} body={expertiseTemp} style={{ minWidth: '100px' }} sortable></Column>
                <Column field="currentEvaluation.initiative" header={t('perfInitiative')} body={initiativeTemp} style={{ minWidth: '100px' }} sortable></Column>
                <Column field="currentEvaluation.leadership" header={t('perfLeadership')} body={leadershipTemp} style={{ minWidth: '100px' }} sortable></Column>
        </Row>
    </ColumnGroup>
  );

  return (
    <div>
      <div>
        <h3 className='fw-lighter'><Icon.BarChart size={20} style={{marginBottom:'3px', marginRight:'4px'}}/><Icon.Gear size={20} style={{marginBottom:'3px'}}/> {t('perfAccountsTitle')}</h3>
        <hr></hr>
        <div className="alert alert-light p-2 mb-3">
          <h4 className='fw-lighter text-start mb-3 px-3'>{t('perfAccountsOverviewTitle')}</h4>
          <Chart type="bar" data={actualEvaluations} style={{height:"200px"}} options={{maintainAspectRatio: false}}/>
        </div>
        <div className='text-secondary alert alert-light'>
          {t('perfAccountsTotal')}: {evaluations.length}
          {search}
          {searchInput.length > 0 && 
          <div className='mt-3'>
            {t('searchResults')}: {filteredEvaluations.length}
          </div>}
        </div>
        <div className='alert alert-light p-1'>
          <DataTable key={updated} value={filteredEvaluations}
            tableStyle={{ minWidth: '50rem' }}
            className='custom-sm-font' headerColumnGroup={headerGroup}
            scrollable scrollHeight='700px' stripedRows selectionMode='single' size='small'
            sortField="id" sortOrder={-1} paginator rowsPerPageOptions={[5, 10, 25, 50]} rows={13} 
            emptyMessage={t('perfAccountsNoResults')}>
            <Column field="id" header={t('id')} style={{ minWidth: '30px' }} sortable frozen ></Column>
            <Column field="firstName" header={t('firstName')} style={{ minWidth: '150px' }} sortable frozen ></Column>
            <Column field="lastName" header={t('lastName')} style={{ minWidth: '150px' }} sortable frozen></Column>
            <Column header="" style={{ minWidth: '30px' }} body={editTemplate} frozen></Column>
            <Column field="currentEvaluation.evaluationDate" header={t('perfAccountsRecentEvaluationDate')} body={dataTemp} style={{ minWidth: '130px' }}  sortable></Column>
            <Column field="currentEvaluation.managerName" header={t('perfEvaluator')} body={managerTemp} style={{ minWidth: '100px' }} sortable></Column>
            <Column field="currentEvaluation.average" header={t('perfAccountsAverageOfLastEvaluation')} body={averageTemp} style={{ minWidth: '150px' }}  sortable></Column>
            <Column field="currentEvaluation.communication" header={t('perfCommunication')} body={communicationTemp} style={{ minWidth: '100px' }} sortable></Column>
            <Column field="currentEvaluation.efficiency" header={t('perfEfficiency')} body={efficiencyTemp} style={{ minWidth: '100px' }} sortable></Column>
            <Column field="currentEvaluation.expertise" header={t('perfExpertise')} body={expertiseTemp} style={{ minWidth: '100px' }} sortable></Column>
            <Column field="currentEvaluation.initiative" header={t('perfInitiative')} body={initiativeTemp} style={{ minWidth: '100px' }} sortable></Column>
            <Column field="currentEvaluation.leadership" header={t('perfLeadership')} body={leadershipTemp} style={{ minWidth: '100px' }} sortable></Column>
          </DataTable>
        </div>
      </div>

      <Modal show={showEditModal} onHide={handleCloseEditModal} size="xl" fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>{t('perfAccountsEditEvaluationsModalTitle')} {selectedUser!=null && (selectedUser.fullName)}</Modal.Title>
        </Modal.Header>
        <Modal.Body >
            <div className='px-5 pt-2'>
              <Tabs id="controlled-tab-example" defaultActiveKey={"evaluations"} className="mb-3" fill>
                <Tab eventKey="evaluations" title={t('evaluations')}>
                <h3 className='fw-lighter'><Icon.PersonFill size={20} style={{marginBottom:'3px'}}/> {t('perfAccountsSelectedUser')}</h3><hr/>
                  <div className='alert alert-light p-2 overflow-auto'>
                    {selectedUser != null && (
                    <>
                      <table className='table table-lg table-hover'>
                        <thead>
                          <tr className='text-left' style={{whiteSpace: "nowrap"}}>
                            <th scope='col'>{t('id')}</th>
                            <th scope='col'>{t('email')}</th>
                            <th scope='col'>{t('firstName')}</th>
                            <th scope='col'>{t('lastName')}</th>
                            <th scope='col'>{t('jobTitle')}</th>
                            <th scope='col'>{t('profileManagerTitle')}</th>
                            <th scope='col'>{t('hasTeam')}</th>
                          </tr>
                        </thead>
                        <tbody>{selectedUser != null && (
                          <tr key={updated} style={{whiteSpace: "nowrap"}}>
                            <th scope='row'><small>{selectedUser.id}</small></th>
                            <td><small>{selectedUser.email}</small></td>
                            <td><small>{selectedUser.firstName}</small></td>
                            <td><small>{selectedUser.lastName}</small></td>
                            <td><small>{selectedUser.jobTitle}</small></td>
                            <td><small>{selectedUser.manager != null ?
                              (selectedUser.manager.firstName + " " + selectedUser.manager.lastName) :
                              "-"}</small></td>
                            <td><small>{(selectedUser.subordinatesCount > 0) ? 
                              <Icon.PeopleFill size={20}/> : 
                              "-"}</small></td>
                          </tr>
                        )}</tbody>
                      </table>
                    </>
                    )}
                  </div>
                  <div className='pb-1'>
                    {selectedUser != null && (selectedUser.currentEvaluation == null ? 
                    (<div className='alert alert-warning'>{t('perfAccountsNoEval')}</div> )
                    : (<MyPerformance id={selectedUser.id} edit/>))}
                  </div>
                </Tab>
                <Tab eventKey="addEvaluation" title={t('perfAccountsAddEvaluation')}>
                  {addEvaluationForm}
                </Tab>
            </Tabs>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>{t('close')}</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
