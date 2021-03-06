import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import SettingSwitch from './SettingSwitch'
import SettingSelect from './SettingSelect'
import { intl as intlShape } from '../../../../../../../../shapes'

const msg = (intl, id) => intl.formatMessage({ id })

const AdvancedSettings = ({
  organizationId,
  aircraftId,
  settings: {
    techlogEnabled,
    engineHoursCounterEnabled,
    engineHoursCounterFractionDigits
  },
  submitting: {
    techlogEnabled: techlogEnabledSubmitting,
    engineHoursCounterEnabled: engineHoursCounterEnabledSubmitting,
    engineHoursCounterFractionDigits: engineHoursCounterFractionDigitsSubmitting
  },
  intl,
  updateSetting
}) => (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage id="aircraft.settings.advanced" />
    </Typography>
    <List>
      <SettingSwitch
        label={msg(
          intl,
          'aircraft.settings.advanced.enginehourscounterenabled'
        )}
        checked={engineHoursCounterEnabled}
        submitting={engineHoursCounterEnabledSubmitting}
        onChange={updateSetting.bind(
          null,
          organizationId,
          aircraftId,
          'engineHoursCounterEnabled'
        )}
      />
      {engineHoursCounterEnabled && (
        <SettingSelect
          label={msg(
            intl,
            'aircraft.settings.advanced.enginehourscounterfractiondigits'
          )}
          value={engineHoursCounterFractionDigits}
          options={[
            { value: 1, label: '1' },
            { value: 2, label: '2' }
          ]}
          submitting={engineHoursCounterFractionDigitsSubmitting}
          onChange={updateSetting.bind(
            null,
            organizationId,
            aircraftId,
            'engineHoursCounterFractionDigits'
          )}
        />
      )}
      <SettingSwitch
        label={msg(intl, 'aircraft.settings.advanced.techlogenabled')}
        checked={techlogEnabled}
        submitting={techlogEnabledSubmitting}
        onChange={updateSetting.bind(
          null,
          organizationId,
          aircraftId,
          'techlogEnabled'
        )}
      />
    </List>
  </>
)

AdvancedSettings.propTypes = {
  organizationId: PropTypes.string.isRequired,
  aircraftId: PropTypes.string.isRequired,
  settings: PropTypes.shape({
    techlogEnabled: PropTypes.bool.isRequired,
    engineHoursCounterEnabled: PropTypes.bool.isRequired,
    engineHoursCounterFractionDigits: PropTypes.oneOf([1, 2]).isRequired
  }),
  submitting: PropTypes.shape({
    techlogEnabled: PropTypes.bool,
    engineHoursCounterEnabled: PropTypes.bool,
    engineHoursCounterFractionDigits: PropTypes.bool
  }).isRequired,
  intl: intlShape,
  updateSetting: PropTypes.func.isRequired
}

export default injectIntl(AdvancedSettings)
