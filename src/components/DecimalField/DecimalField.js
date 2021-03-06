import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'

const formatDecimalNumber = (value, fractionDigits = 2) =>
  Number(value).toFixed(fractionDigits)

class DecimalField extends React.Component {
  state = {
    stringValue:
      typeof this.props.value === 'number'
        ? formatDecimalNumber(this.props.value / 100, this.props.fractionDigits)
        : ''
  }

  constructor(props) {
    super(props)
    this.numberInput = React.createRef()
  }

  handleChange = e => {
    this.setState({
      stringValue: e.target.value
    })
  }

  handleFocus = () => {
    this.numberInput.current.addEventListener('wheel', this.handleWheel, {
      passive: false // important to register as active listener to be able to use `preventDefault` in handle wheel
    })
  }

  handleBlur = () => {
    const { onChange, fractionDigits } = this.props

    this.numberInput.current.removeEventListener('wheel', this.handleWheel)

    const floatValue = parseFloat(this.state.stringValue)
    if (!isNaN(floatValue)) {
      const roundingFactor = fractionDigits === 1 ? 10 : 100
      const roundedNumber =
        Math.round(floatValue * roundingFactor) / roundingFactor
      const stringValue = formatDecimalNumber(roundedNumber, fractionDigits)

      this.setState({
        stringValue
      })

      if (onChange) {
        const hundredths = Math.round(roundedNumber * 100)
        onChange(hundredths)
      }
    } else if (this.state.stringValue === '' && onChange) {
      onChange(null)
    }
  }

  handleWheel = e => {
    e.preventDefault() // prevent number from being changed by scrolling
  }

  render() {
    const {
      label,
      cy,
      margin,
      fullWidth,
      error,
      disabled,
      fractionDigits
    } = this.props
    const { stringValue } = this.state
    return (
      <TextField
        label={label}
        value={stringValue}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        inputRef={this.numberInput}
        type="number"
        inputProps={{ step: fractionDigits === 1 ? '0.1' : '.01' }}
        data-cy={cy}
        margin={margin}
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
      />
    )
  }
}

DecimalField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number, // integer value (hundredths)
  cy: PropTypes.string,
  margin: PropTypes.string,
  fullWidth: PropTypes.bool,
  onChange: PropTypes.func,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  fractionDigits: PropTypes.oneOf([1, 2])
}

export default DecimalField
