import * as React from 'react';
import * as Icon from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Knob } from 'primereact/knob';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Tooltip } from 'primereact/tooltip';
import Collapse from 'react-bootstrap/Collapse';
import { useTranslation } from 'react-i18next';
import { useReducer } from 'react';

export default function MyPerformance(props) {
  // props
  // id = id
  // edit = true
  const [evaluations, setEvaluations] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDetails, setShowDetais] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const { t } = useTranslation();
  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  const getEvaluations = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/evaluations/${props.id}`
    }).then((response) => {
        setEvaluations(response.data);
        if(response.data != null
        && response.data.length > 0) {
          setLastEvaluation(response.data[response.data.length-1])
        } else {
          setLastEvaluation(null);
        }
        setUpdated(!updated);
        forceUpdate();
    }).catch(function (error) {
        console.log(error.message);
        localStorage.clear();
        window.location.reload();
    });
  }

  useEffect(() => {
    getEvaluations();
  },[])

  const communicationTemp = (rowData) => {
    if (rowData.communication != undefined) {
      return `${(rowData.communication*100).toFixed(0)}`;;
    }
  };

  const averageTemp = (rowData) => {
    if (rowData.average != undefined) {
      return `${(rowData.average*100).toFixed(0)}`;;
    }
  };

  const efficiencyTemp = (rowData) => {
    if (rowData.efficiency != undefined) {
      return `${(rowData.efficiency*100).toFixed(0)}`;;
    }
  };
  
  const expertiseTemp = (rowData) => {
    if (rowData.expertise != undefined) {
      return `${(rowData.expertise*100).toFixed(0)}`;;
    }
  };

  const initiativeTemp = (rowData) => {
    if (rowData.initiative != undefined) {
      return `${(rowData.initiative*100).toFixed(0)}`;;
    }
  };

  const leadershipTemp = (rowData) => {
    if (rowData.leadership != undefined) {
      return `${(rowData.leadership*100).toFixed(0)}`;;
    }
  };

  const handleOpenViewModal = (rowData) => {
    setSelectedEvaluation(rowData);
    setShowDetais(true);
    setShowViewModal(true);
  }

  const viewTemplate = (row) => {
    return <small className='btn btn-sm btn-outline-dark border-0 d-flex justify-content-center'
      style={{marginRight:"-7px"}} onClick={() => handleOpenViewModal(row)}><Icon.ZoomIn size={15}/></small> 
  };

  const deleteTemplate = (row) => {
    return <small className='btn btn-sm btn-outline-danger border-0 d-flex justify-content-center'
      style={{margin:"0px"}}
      onClick={() => handleDelete(props.id, row.id)}><Icon.Trash3/></small> 
  };

  const evaluationAverage = (e) => {
    let total = e.communication + e.expertise + e.leadership + e.initiative + e.efficiency;
    return total/5;
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

  const handleCloseViewModal = () => {
    setShowDetais(false);
    setShowViewModal(false);
  }

  const toggleDetails = () => {
    setShowDetais(!showDetails);
  }

  const handleDelete = (userId, evaluationId) => {
    if(window.confirm(t('confirmDeleteEvaluation'))) {
      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        method: "DELETE",
        url: `http://localhost:8082/evaluations/${userId}/${evaluationId}`
      }).then((response) => {
        getEvaluations();
        setUpdated(!updated);
        setShowViewModal(false);
        forceUpdate();
      }).catch(function (error) {
        console.log(error.message);
        localStorage.clear();
        window.location.reload();
      });
    } else {
      alert(t('canceledDelete'));
    }
  }

  const viewEvaluation = (lastEvaluation) => { return (
    <div className='alert p-3'>
      <div className='row d-flex justify-content-center'>
        <div className='col-sm-12 col-md-3'>
        {lastEvaluation != null && (
          <div className='text-center alert alert-light'>
            <div className=''>{t('average')}</div>
            <Knob value={(evaluationAverage(lastEvaluation)*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((evaluationAverage(lastEvaluation)*100).toFixed(0))[1]} readOnly/>
            <div>{grade((evaluationAverage(lastEvaluation)*100).toFixed(0))[0]}</div>
          </div>
        )}
      </div>
      <div key={_} className='d-flex justify-content-center col-sm-12 col-md-9'>
        {lastEvaluation != null && (
          <>
            <div className='text-center m-lg-3 m-xl-3'>
              <div>{t('perfCommunication')}</div>
              <Tooltip target=".communication" mouseTrack mouseTrackTop={40} position='bottom' content={t('perfCommunicationTooltip')}/>
              <Knob className='communication' value={(lastEvaluation.communication*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((lastEvaluation.communication*100).toFixed(0))[1]} size={80} readOnly/>
              <div>{grade(((lastEvaluation.communication)*100).toFixed(0))[0]}</div>
            </div>
            <div className='text-center m-lg-3 m-xl-3'>
              <div>{t('perfEfficiency')}</div>
              <Knob className='efficiency' value={(lastEvaluation.efficiency*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((lastEvaluation.efficiency*100).toFixed(0))[1]} size={80} readOnly/>
              <Tooltip target=".efficiency" mouseTrack mouseTrackTop={40} position='bottom' content={t('perfEfficiencyTooltip')} />
              <div>{grade(((lastEvaluation.efficiency)*100).toFixed(0))[0]}</div>
            </div>
            <div className='text-center m-lg-3 m-xl-3'>
              <div>{t('perfExpertise')}</div>
              <Tooltip target=".expertise" mouseTrack mouseTrackTop={40} position='bottom' content={t('perfExpertiseTooltip')} />
              <Knob className='expertise' value={(lastEvaluation.expertise*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((lastEvaluation.expertise*100).toFixed(0))[1]} size={80} readOnly/>
              <div>{grade(((lastEvaluation.expertise)*100).toFixed(0))[0]}</div>
            </div>
            <div className='text-center m-lg-3 m-xl-3'>
              <div>{t('perfInitiative')}</div>
              <Knob className='initiative' value={(lastEvaluation.initiative*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((lastEvaluation.initiative*100).toFixed(0))[1]} size={80} readOnly/>
              <Tooltip target=".initiative" mouseTrack mouseTrackTop={40} position='bottom' content={t('perfInitiativeTooltip')} />
              <div>{grade(((lastEvaluation.initiative)*100).toFixed(0))[0]}</div>
            </div>
            <div className='text-center m-lg-3 m-xl-3'>
              <div>{t('perfLeadership')}</div>
              <Tooltip target=".leadership" mouseTrack mouseTrackTop={40} position='bottom' content={t('perfLeadershipTooltip')} />
              <Knob className='leadership' value={(lastEvaluation.leadership*100).toFixed(0)} valueTemplate={'{value}'} valueColor={grade((lastEvaluation.leadership*100).toFixed(0))[1]} size={80} readOnly/>
              <div>{grade(((lastEvaluation.leadership)*100).toFixed(0))[0]}</div>
            </div>
          </>
        )}
        </div>
      </div>
      <div className='d-flex justify-content-center'>{!showDetails && (<a class="btn btn-outline-primary btn-sm mt-3" role="button" onClick={() => toggleDetails()} >{t('perfShowDetails')}</a>)}</div>
      <Collapse in={showDetails}>
        <div className='alert alert-light'>
          <div className='row'>
            <div className='col-md-3'>
              <div className='fw-lighter text-start my-2'>{t('perfEvaluationDate')}</div>
              <div>
                {lastEvaluation != null && lastEvaluation.evaluationDate}
              </div>
            </div>

            <div className='col-md-4'>
              <div className='fw-lighter text-start my-2'>{t('perfEvaluator')}</div>
              <div>
                {lastEvaluation != null && lastEvaluation.managerName}
              </div>
            </div>

            <div className='col-sm-12 row'>
              <div className='fw-lighter text-start my-2'>{t('perfFeedback')}</div>
              <div className='overflow-auto' style={{maxHeight:"112px"}}>
                {lastEvaluation != null && lastEvaluation.feedback}
              </div>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  )}

  return (
    <div>
      <h3 className='fw-lighter'><Icon.BarChartFill size={20} style={{marginBottom:'3px'}}/> {t('performanceTitle')}</h3><hr/>
      <h4 className='fw-lighter text-start mb-3 px-3'>{lastEvaluation != null &&(<>({t('perfLastEval')} {lastEvaluation.evaluationDate})</>)}</h4>
      {lastEvaluation!=null && viewEvaluation(lastEvaluation)}
      <div className='alert alert-light p-2'>
        <h4 className='fw-lighter text-start'>{t('perfHistory')}</h4>
        <DataTable key={_} value={evaluations} size='small' showGridlines stripedRows selectionMode="single" 
          sortField="evaluationDate" sortOrder={-1}
          scrollable scrollHeight="353px" className='custom-sm-font' emptyMessage={t('perfAccountsNotEvaluated')}>
          <Column field="evaluationDate" header={t('perfEvaluationDate')} sortable style={{ minWidth: '130px' }} frozen></Column>
          <Column style={{ minWidth: '50px' }} body={viewTemplate} frozen></Column>
          {props.edit && <Column style={{ minWidth: '50px' }} body={deleteTemplate} frozen></Column>}
          <Column field="average" header={t('average')}  body={averageTemp} sortable style={{ minWidth: '80px' }}></Column>
          <Column field="communication" header={t('perfCommunication')}  body={communicationTemp} sortable style={{ minWidth: '130px' }}></Column>
          <Column field="efficiency" header={t('perfEfficiency')} body={efficiencyTemp} sortable style={{ minWidth: '130px' }}></Column>
          <Column field="expertise" header={t('perfExpertise')} body={expertiseTemp} sortable style={{ minWidth: '130px' }}></Column>
          <Column field="initiative" header={t('perfInitiative')} body={initiativeTemp} sortable style={{ minWidth: '130px' }}></Column>
          <Column field="leadership" header={t('perfLeadership')} body={leadershipTemp} sortable style={{ minWidth: '130px' }}></Column>
          <Column field="managerName" header={t('perfEvaluator')} sortable style={{ minWidth: '180px' }}></Column>
        </DataTable>
      </div>

      <Modal show={showViewModal} onHide={handleCloseViewModal} size="xl" fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>{t('perfViewEvalTitle')} {selectedEvaluation!=null && selectedEvaluation.evaluationDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body >
            <div>
              {selectedEvaluation != null && viewEvaluation(selectedEvaluation)}
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>{t('close')}</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
