import * as React from 'react';
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import axios from 'axios';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslation } from 'react-i18next';

export default function MySalary(props) {
  const [updated, setUpdated] = useState(false);
  const [salariesMatrix, setSalariesMatrix] = useState([]);
  const [lastSalary, setLastSalary] = useState();
  const [totalLastPackage, setTotalLastPackage] = useState(0);
  const { t } = useTranslation();
  const [datasetsLabels, setDataSetsLabels] = useState([
    t('salaryPackageSearchHeaderPerformance'),
    t('salaryPackageSearchHeaderProject'),
    t('salaryPackageSearchHeaderMeal'),
    t('salaryPackageSearchHeaderInsurance'),
    t('salaryPackageSearchHeaderBase'),
    t('salaryPackageSearchHeaderBenefits'),
    t('total')
  ])
  const [salaries, setSalaries] = useState({
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

  const getSalaries = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/salaries/map/${props.id}`
    }).then((responseAuth) => {
        for(let g=0; g < responseAuth.data.datasets.length; g++) {
          responseAuth.data.datasets[g].label = datasetsLabels[g];
        }
        setSalaries(responseAuth.data);
        let matSalaries = []
        for(let i=0; i < responseAuth.data.labels.length; i++) {
          matSalaries.push({
            date: responseAuth.data.labels[i],
            bonusPerf: responseAuth.data.datasets[0].data[i],
            bonusProj: responseAuth.data.datasets[1].data[i],
            mealTickets: responseAuth.data.datasets[2].data[i],
            insurance: responseAuth.data.datasets[3].data[i],
            base: responseAuth.data.datasets[4].data[i],
            benefits: responseAuth.data.datasets[5].data[i],
            total: responseAuth.data.datasets[6].data[i]
          })
        }
        setSalariesMatrix(matSalaries)
        let total = 0;
        if(matSalaries.length > 0) {
          let arrLabels = responseAuth.data.datasets.map(function (a) {return a.label});
          arrLabels = arrLabels.slice(0, arrLabels.length-1);
          let arrSalary = Object.values(matSalaries[matSalaries.length-1]);
          total = arrSalary[arrSalary.length-1];
          arrSalary = arrSalary.slice(1,7).map( function(a) {return Math.trunc(a/total*100)});
          setLastSalary(
            {
              labels: arrLabels,
              datasets: [
                  {
                      data: arrSalary
                  }
              ]
            }
          )
        }
        setTotalLastPackage(total);
        setUpdated(!updated);
    }).catch(function (error) {
        console.log(error.message);
        localStorage.clear();
        window.location.reload();
    });
  }

  useEffect(() => {
    getSalaries();
  },[])

  const totalTemp = (rowData) => {
    if (rowData.total != undefined) {
      return `${formatCurrency(rowData.total)}`;
    }
  };

  const baseTemp = (rowData) => {
    if (rowData.base != undefined) {
      return `${formatCurrency(rowData.base)}`;
    }
  };

  const bonusPerfTemp = (rowData) => {
    if (rowData.bonusPerf != undefined) {
      return `${formatCurrency(rowData.bonusPerf)}`;
    }
  };

  const bonusProjTemp = (rowData) => {
    if (rowData.bonusProj != undefined) {
      return `${formatCurrency(rowData.bonusProj)}`;
    }
  };

  const mealTicketsTemp = (rowData) => {
    if (rowData.mealTickets != undefined) {
      return `${formatCurrency(rowData.mealTickets)}`;
    }
  };

  const insuranceTemp = (rowData) => {
    if (rowData.insurance != undefined) {
      return `${formatCurrency(rowData.insurance)}`;
    }
  };

  const benefitsTemp = (rowData) => {
    if (rowData.benefits != undefined) {
      return `${formatCurrency(rowData.benefits)}`;
    }
  };

  const formatCurrency = (value) => {
      return value.toLocaleString('ro-RO', { style: 'currency', currency: 'ron' });
  };

  return (
    <div>
      <div className=''>
        <h3 className='fw-lighter'><Icon.Bank size={22} style={{marginBottom:'4px'}}/> {t('salaryTitle')}</h3><hr/>
        <div className='row p-2'>
          <div className='alert alert-light'>
            <h4 className='fw-lighter'>{t('personalSalaryOverTimeTitle')}</h4>
            <Chart type="line" data={salaries} style={{height:"300px"}} options={{maintainAspectRatio: false}}/>
          </div>
        </div>
        <div className='alert alert-light'>
          <h4 className='fw-lighter'>{t('currentSalaryTitle')}</h4>
          <DataTable value={salariesMatrix.slice(salariesMatrix.length-1)} size='small' showGridlines stripedRows selectionMode="single" 
            sortField="date" sortOrder={-1}
            scrollable scrollHeight="353px" className='custom-sm-font' emptyMessage={t('salaryPackageSearchNoResults')}>
            <Column field="date" header={t('salaryDate')} sortable style={{ minWidth: '130px' }} frozen></Column>
            <Column field="total" header={t('total')} sortable style={{ minWidth: '130px' }} body={totalTemp}></Column>
            <Column field="base" header={t('salaryPackageSearchHeaderBase')} sortable style={{ minWidth: '130px' }} body={baseTemp}></Column>
            <Column field="bonusPerf" header={t('salaryPackageSearchHeaderPerformance')} sortable style={{ minWidth: '130px' }} body={bonusPerfTemp}></Column>
            <Column field="bonusProj" header={t('salaryPackageSearchHeaderProject')} sortable style={{ minWidth: '130px' }} body={bonusProjTemp}></Column>
            <Column field="mealTickets" header={t('salaryPackageSearchHeaderMeal')} sortable style={{ minWidth: '130px' }} body={mealTicketsTemp}></Column>
            <Column field="insurance" header={t('salaryPackageSearchHeaderInsurance')} sortable style={{ minWidth: '130px' }} body={insuranceTemp}></Column>
            <Column field="benefits" header={t('salaryPackageSearchHeaderBenefits')} sortable style={{ minWidth: '130px' }} body={benefitsTemp}></Column>
          </DataTable>
        </div>
        <div className='row'>
          <div className='text-center col-12 col-sm-12 col-md-4 p-2'>
            <div className='alert alert-light'>
              <h4 className='fw-lighter'>{t('currentSalaryContributions')}</h4>
              <Chart key={updated} type="pie" data={lastSalary} options={{
                maintainAspectRatio: false,
                cutout: '30%',
                legend: {
                    position: 'left',
                    labels: {
                      boxWidth: 10
                    }
                }
              }}/>
            <div className='alert alert-light bg-white mt-2 mb-0'>
              {t('currentSalaryTitle')}: {formatCurrency(totalLastPackage)}
            </div>
            </div>
          </div>
          <div className='text-center col-12 col-sm-12 col-md-8 p-2'>
            <div className='alert alert-light'>
              <h4 className='fw-lighter text-start'>{t('salaryPackageHistoryTitle')}</h4>
              <DataTable value={salariesMatrix} size='small' showGridlines stripedRows selectionMode="single" 
                sortField="date" sortOrder={-1}
                scrollable scrollHeight="353px" className='custom-sm-font' emptyMessage={t('salaryPackageSearchNoResults')}>
                <Column field="date" header={t('salaryDate')} sortable style={{ minWidth: '130px' }} frozen></Column>
                <Column field="total" header={t('total')} sortable style={{ minWidth: '130px' }} body={totalTemp}></Column>
                <Column field="base" header={t('salaryPackageSearchHeaderBase')} sortable style={{ minWidth: '130px' }} body={baseTemp}></Column>
                <Column field="bonusPerf" header={t('salaryPackageSearchHeaderPerformance')} sortable style={{ minWidth: '130px' }} body={bonusPerfTemp}></Column>
                <Column field="bonusProj" header={t('salaryPackageSearchHeaderProject')} sortable style={{ minWidth: '130px' }} body={bonusProjTemp}></Column>
                <Column field="mealTickets" header={t('salaryPackageSearchHeaderMeal')} sortable style={{ minWidth: '130px' }} body={mealTicketsTemp}></Column>
                <Column field="insurance" header={t('salaryPackageSearchHeaderInsurance')} sortable style={{ minWidth: '130px' }} body={insuranceTemp}></Column>
                <Column field="benefits" header={t('salaryPackageSearchHeaderBenefits')} sortable style={{ minWidth: '130px' }} body={benefitsTemp}></Column>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
