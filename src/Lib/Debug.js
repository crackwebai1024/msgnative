import { withProps } from 'recompose'

/*
  Return Hoc with printing out all props to console
  ex:
  debugProps('Component props:')(Component)
*/

export const debugProps = prefix => withProps(console.log.bind(console, prefix))
