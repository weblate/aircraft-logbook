import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Redirect } from 'react-router-dom'
import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import isLoaded from '../../../../../../../../util/isLoaded'
import {
  organization as organizationShape,
  aircraft as aircraftShape
} from '../../../../../../../../shapes'
import LoadingIcon from '../../../../../../../../components/LoadingIcon'
import FlightList from '../../containers/FlightListContainer'

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

class AircraftFlights extends React.Component {
  componentDidMount() {
    const {
      organization,
      fetchAircrafts,
      fetchMembers,
      fetchAerodromes
    } = this.props

    if (organization) {
      fetchAircrafts(organization.id)
      fetchMembers(organization.id)
      fetchAerodromes(organization.id)
    }
  }

  componentDidUpdate(prevProps) {
    const {
      organization,
      fetchAircrafts,
      fetchMembers,
      fetchAerodromes
    } = this.props

    if (
      organization &&
      (!prevProps.organization || prevProps.organization.id !== organization.id)
    ) {
      fetchAircrafts(organization.id)
      fetchMembers(organization.id)
      fetchAerodromes(organization.id)
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

    return (
      <div className={classes.container}>
        <Typography variant="h4" gutterBottom>
          {aircraft.registration}
        </Typography>
        <Button
          href={`/organizations/${organization.id}/aircrafts/${aircraft.id}`}
          color="primary"
        >
          <FormattedMessage id="aircraft.flights.tooverview" />
        </Button>
        <Typography variant="h5" gutterBottom>
          <FormattedMessage id="aircraft.flights" />
        </Typography>
        <FlightList organization={organization} aircraft={aircraft} />
      </div>
    )
  }
}

AircraftFlights.propTypes = {
  organization: organizationShape,
  aircraft: aircraftShape,
  classes: PropTypes.object.isRequired,
  fetchAircrafts: PropTypes.func.isRequired,
  fetchMembers: PropTypes.func.isRequired,
  fetchAerodromes: PropTypes.func.isRequired
}

export default withStyles(styles)(AircraftFlights)
