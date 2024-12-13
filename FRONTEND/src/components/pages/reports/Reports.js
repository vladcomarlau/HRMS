import * as React from 'react';
import axios from 'axios';
import * as Icon from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';
import SearchBar from '../../search/SearchBar';
import { useReducer } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Chart } from 'primereact/chart';
import Plot from "react-plotly.js";
import { useTranslation } from 'react-i18next';

export default function Reports(props) {
  // props 
  const [correlationEvaluations, setCorrelationEvaluations] = useState([]);
  const [correlationSalaries, setCorrelationSalaries] = useState([]);
  const [correlationCoef, setCorrelationCoef] = useState(0.0);
  const [correlationSelectedUserId, setCorrelationSelectedUserId] = useState(null);

  const { t } = useTranslation();

  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  const [ageChartData, setAgeChartData] = useState([]);
  const [pieChartAgeData, setPieChartAgeData] = useState([]);
  const [datePlot, setDatePlot] = useState([]);
  const [dateHeatMap, setDateHeatMap] = useState([]);

  const [users, setUsers] = useState([]);
  const [chartCorrelationData, setChartCorrelationData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            data: [1, 1, 1, 1, 2, 2, 3],
        },
        {
            data: [1, 1, 1, 1, 2, 2, 3]
        }
      ]
  });

  useEffect(() => {
    fetchEvaluations();
    getCorrelationCoef(2);
  }, [])

  const fetchEvaluations = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/users/simplifiedForReports`
    }).then((responseAuth) => {
      let usersOrdered = responseAuth.data.sort(function (firstUser, secondUser) {
        if (firstUser.fullName < secondUser.fullName) {
          return -1;
        }
        if (firstUser.fullName > secondUser.fullName) {
          return 1;
        }
        return 0;
        });
        setUsers(usersOrdered);

        const ageGroups = [[18, 25], [26, 32], [33, 40], [41, 50], [51, 60], [61, 65], [66, 80]];
        let countGroups = [];

        let ageMap = usersOrdered.map(a => {
          if(a != null ) {
            return a.age;
        }})
        .filter(function( element ) {
          return element !== undefined && element > 0;
        });

        let seniorities = usersOrdered.map(a => {
          if(a != null ) {
            return a.seniority;
        }})

        if(usersOrdered.length > 0) {
          for(let i = 0; i < ageGroups.length; i++) { 
            countGroups[i] = (ageMap.filter(function( age ) {
              return (age >= ageGroups[i][0] && age <= ageGroups[i][1]);
            })).length
          }
        }

        setAgeChartData({
          labels: ageGroups.map(group => group[0] + "-" + group[1]),
          datasets: [
              {
                label: t('reportsEmployeesDistributionDescription'),
                data: countGroups
              }
            ]
        });

        let total = usersOrdered.length;
        let agePercentages = countGroups.map(a => (a/total*100).toFixed(1))
        setPieChartAgeData({
          labels: ageGroups.map(group => group[0] + "-" + group[1]),
          datasets: [
              {
                data: agePercentages
              }
            ]
        })

        setDatePlot([
          {
            x: ageMap,
            y: seniorities,
            mode: "markers",
            type: "scatter",
          },
        ])

        let evaluations = usersOrdered.filter(function( user ) {
          return user !== undefined && user.currentEvaluationAverage != undefined;
        }).map((user) => (user.currentEvaluationAverage*100))

        setDateHeatMap([
          {
            x: ageMap,
            y: seniorities,
            z: evaluations,
            type: 'scatter3d',
            mode: 'markers',
            marker: {
              size: 10,
              color: 'rgb(127, 127, 255)',
              opacity: 0.8,
            },
          }
        ])

      }).catch((error) => {
        console.log(error.message);
      })
  }

  const getCorrelationCoef = (user) => {    
    if(user != null && user.value != null) {
      setCorrelationSelectedUserId(user.value);

      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        method: "GET",
        url: `http://localhost:8082/users/correlation/${user.value.id}`
      }).then((responseAuth) => {
        setCorrelationCoef(responseAuth.data.correlationCoefficient);
        setCorrelationEvaluations(responseAuth.data.recentEvaluations);
        setCorrelationSalaries(responseAuth.data.recentSalaries);
        setChartCorrelationData({
          labels: responseAuth.data.recentEvaluations.map((a,index) => index),
          datasets: [
              {
                label: t('reportsEvolutionEvaluations'),
                fill: true,
                tension: 0.4,
                yAxisID: "y",
                data: responseAuth.data.recentEvaluations.map((a) => a.average*100),
              },
              {
                label: t('reportsEvolutionSalaries'),
                fill: true,
                tension: 0.4,
                yAxisID: "y1",
                data: responseAuth.data.recentSalaries.map((a) => a.total)
              }
            ]
        });
        forceUpdate();
      }).catch((error) => {
        console.log(error.message);
      })
    }
  }

  const averageTemp = (rowData) => {
    if (rowData.average != undefined) {
      return `${(rowData.average*100).toFixed(0)}`;;
    }
  };

  const totalTemp = (rowData) => {
    if (rowData.total != undefined) {
      return `${formatCurrency(rowData.total)}`;
    }
  };

  const formatCurrency = (value) => {
      return value.toLocaleString('ro-RO', { style: 'currency', currency: 'ron' });
  };

  const correlationCoefInterpretation = (val) => {
    let grade;
    let classes = 'badge mx-1 pe-2 shadow rounded bg-primary'
    switch (true) {
      case (val == 0.0):
        grade = <div className={classes}>{t('reportsCorrelNoCorrel')}</div>;
        break;

      case (val > -0.2 && val < 0.0):
        grade = <div className={classes}>{t('reportsCorrelNegVeryWeak')}</div>;
        break;
      case (val > -0.4 && val <= -0.2):
        grade = <div className={classes}>{t('reportsCorrelNegWeak')}</div>;
        break;
      case (val > -0.6 && val <= -0.4):
        grade = <div className={classes}>{t('reportsCorrelNegModerate')}</div>;
        break;
      case (val > -0.8 && val <= -0.6):
        grade = <div className={classes}>{t('reportsCorrelNegStrong')}</div>;
        break;
      case (val > -1.0 && val <= -0.8):
        grade = <div className={classes}>{t('reportsCorrelNegVeryStrong')}</div>;
        break;
      
      case (val > 0.0 && val <= 0.2):
        grade = (<div className={classes}>{t('reportsCorrelPosVeryWeak')}</div>);
        break;
      case (val > 0.2 && val <= 0.4):
        grade = <div className={classes}>{t('reportsCorrelPosWeak')}</div>;
        break;
      case (val > 0.4 && val <= 0.6):
        grade = <div className={classes}>{t('reportsCorrelPosModerate')}</div>;
        break;
      case (val > 0.6 && val <= 0.8):
        grade = <div className={classes}>{t('reportsCorrelPosStrong')}</div>;
        break;
      case (val > 0.8 && val <= 1.0):
        grade = <div className={classes}>{t('reportsCorrelPosVeryStrong')}</div>;
        break;
    }
    return grade;
  }

  return (
    <div>
      <div className='row alert alert-light p-0 mt-0'
        style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
        <ul className='nav nav-pills nav-fill'>
          <SearchBar/>
        </ul>
      </div>
      <div className='p-2'>
        <h3 className='fw-lighter'><Icon.GraphUp size={20} style={{marginBottom:'3px'}}/> {t('reportsTitle')}</h3><hr/>
        <div className='alert alert-light'>
          <h4 className='fw-lighter'>{t('reportsCorrelationDescription')}</h4>
          {t('reportsCorrelationAccount')}: {users.length > 0 && (<Dropdown key={_} value={correlationSelectedUserId} onChange={(e) => getCorrelationCoef(e)} 
          options={users} optionLabel="fullName" placeholder={t('reportsCorrelationChooseAccountPH')} className="w-50" />)}
          {correlationSelectedUserId != null ? ((correlationEvaluations.length > 2 && correlationSalaries.length > 2) ? (
          <div>
            <div className='mt-3 alert border'>{t('reportsCorrelIndicactor')}: {(correlationCoef * 100).toFixed(5)}% {correlationCoefInterpretation(correlationCoef)}</div>
            <Chart type="line" data={chartCorrelationData} style={{height:"300px"}} options={{maintainAspectRatio: false,
              scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right'
                }
            }
            }}/>
            <div className='alert border border-muted mt-3'>
              <div className='mt-3 fs-5'>{t('reportsCorrelSeriesUsed')}<hr></hr></div>
              <div className='mt-4 row'>
                <div key={_} className='col-md-6'>
                  <DataTable value={correlationEvaluations} size='small' showGridlines stripedRows selectionMode="single" 
                    sortField="evaluationDate" sortOrder={-1}
                    scrollable scrollHeight="253px" className='custom-sm-font' emptyMessage={t('perfTeamsNoEval')}>
                    <Column field="evaluationDate" header={t('evaluationDate')} sortable style={{ minWidth: '130px' }} frozen></Column>
                    <Column field="average" header={t('average')} body={averageTemp} sortable style={{ minWidth: '80px' }}></Column>
                  </DataTable>
                </div>
                <div style={{display:"inline"}} className='col-md-6'>
                  <DataTable value={correlationSalaries} size='small' showGridlines stripedRows selectionMode="single" 
                    sortField="date" sortOrder={-1}
                    scrollable scrollHeight="253px" className='custom-sm-font' emptyMessage={t('salaryPackageSearchNoResults')}>
                    <Column field="date" header={t('salaryDate')} sortable style={{ minWidth: '130px' }} frozen></Column>
                    <Column field="total" header={t('total')} sortable style={{ minWidth: '130px' }} body={totalTemp}></Column>
                  </DataTable>
                </div>
              </div>
            </div>
          </div>
          ):(
            <div className='alert alert-warning mt-3'>
              {t('reportsErrorCorrelNotEnoughData')}
            </div>
          )): (
            <div className='alert alert-warning mt-3'>
              {t('reportsCorrelAlertNoAccount')}
            </div>
          )}
        </div>

        <div className='alert alert-light'>
          <h4 className='fw-lighter'>{t('reportsEmployeesDistributionTitle')}</h4><br></br>
          <div className='row'>
            <Chart type="bar" data={ageChartData} style={{height:"300px"}} options={{maintainAspectRatio: false}} className='col-md-6'/>
            <div  className='col-md-6 mt-1'>
              <div className='text-black-50'><small>{t('reportsEmployeesDistributionPercentage')}</small></div>
              <Chart type="pie" data={pieChartAgeData} style={{height:"250px"}} options={{maintainAspectRatio: false}}/>
            </div>
          </div>
        </div>

        <div className='alert alert-light d-flex justify-content-center'>
          <Plot className='w-100' data={datePlot} style={{height:"500px"}}
            layout={{
              title: t('reportsScatterChartTitle'),
              xaxis: {
                title: t('ageTitle'),
              },
              yaxis: {
                title: t('seniorityTitle'),
              }
            }}
          />
        </div>

        <div className='alert alert-light'>
          <Plot className='w-100' data={dateHeatMap} style={{height:"700px"}}
            layout={{
              title: t('reports3DScatterChartTitle'),
              scene: {
                xaxis: { title: t('reports3DScatterX') },
                yaxis: { title: t('reports3DScatterY') },
                zaxis: { title: t('reports3DScatterZ')},
              },
            }}
          />
        </div>
      </div>
    </div>)
}
