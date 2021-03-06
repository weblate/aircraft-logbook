import React from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import isLoaded from '../../../../../../../../util/isLoaded'
import {
  organization as organizationShape,
  aircraft as aircraftShape
} from '../../../../../../../../shapes'
import LoadingIcon from '../../../../../../../../components/LoadingIcon'
import Checks from '../../containers/ChecksContainer'
import FuelTypes from '../../containers/FuelTypesContainer'
import AdvancedSettings from '../../containers/AdvancedSettingsContainer'

const styles = theme => ({
  container: {
    padding: '1em',
    [theme.breakpoints.up(1000 + theme.spacing(3 * 2))]: {
      width: 1000,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }
})

class AircraftSettings extends React.Component {
  isOrganizationOrTechlogManager = () =>
    this.props.organization.roles.some(role =>
      ['manager', 'techlogmanager'].includes(role)
    )

  componentDidMount() {
    const { organization, fetchAircrafts } = this.props

    if (organization) {
      fetchAircrafts(organization.id)
    }
  }

  componentDidUpdate(prevProps) {
    const { organization, fetchAircrafts } = this.props

    if (
      organization &&
      (!prevProps.organization || prevProps.organization.id !== organization.id)
    ) {
      fetchAircrafts(organization.id)
    }
  }

  render() {
    const { organization, aircraft, classes } = this.props

    if (organization === null) {
      return <Redirect to="/" />
    }

    if (!isLoaded(organization) || !isLoaded(aircraft)) {
      return <LoadingIcon />
    }

    if (aircraft === null) {
      return <Redirect to={`/organizations/${organization.id}`} />
    }

    if (!this.isOrganizationOrTechlogManager()) {
      return (
        <Redirect
          to={`/organizations/${organization.id}/aircrafts/${aircraft.id}`}
        />
      )
    }

    return (
      <div className={classes.container}>
        <Typography variant="h4" gutterBottom>
          {aircraft.registration}
        </Typography>
        <Checks organizationId={organization.id} aircraftId={aircraft.id} />
        <FuelTypes organizationId={organization.id} aircraftId={aircraft.id} />
        <AdvancedSettings
          organizationId={organization.id}
          aircraftId={aircraft.id}
        />
      </div>
    )
  }
}

AircraftSettings.propTypes = {
  organization: organizationShape,
  aircraft: aircraftShape,
  classes: PropTypes.object.isRequired,
  fetchAircrafts: PropTypes.func.isRequired
}

export default withStyles(styles)(AircraftSettings)
