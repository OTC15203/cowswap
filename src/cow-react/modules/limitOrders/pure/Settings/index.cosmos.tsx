import { Settings, SettingsProps } from './index'

const defaultProps: SettingsProps = {
  state: { expertMode: true, showRecipient: false, deadline: 200_000, customDeadline: null },
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <Settings {...defaultProps} />
