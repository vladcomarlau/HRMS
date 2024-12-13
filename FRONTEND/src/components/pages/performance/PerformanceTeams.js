import * as React from 'react';
import * as Icon from 'react-bootstrap-icons';
import AllTeams from '../organization/AllTeams';
import { useTranslation } from 'react-i18next';

export default function PerformanceTeams() {
  const { t } = useTranslation();

  return (
    <div>
      <div>
        <h3 className='fw-lighter'><Icon.BarChart size={20} style={{marginBottom:'3px', marginRight:'4px'}}/><Icon.PeopleFill size={20} style={{marginBottom:'3px'}}/> {t('perfTeamsTitle')}</h3>
        <hr></hr>
        <div className='alert alert-warning'>
          {t('perfTeamsDescription')}
        </div>
        <AllTeams small evaluations/>
      </div>
    </div>)
}
