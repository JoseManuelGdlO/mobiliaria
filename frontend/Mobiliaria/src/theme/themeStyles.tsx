import { StyleSheet } from 'react-native'
import colors from './colors'

export default StyleSheet.create({
  defaultContainer: {
    flex: 1,
    padding: 16
  },
  card: {
    borderRadius: 20,
    marginVertical: 20,
    backgroundColor: '#111111',
    padding: 15,
    flex: 1
  },
  textStrong: {
    fontWeight: 'bold',
    color: 'white'
  },
  textStrongBlue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.Primario500
  },
  textStrongRed: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC1C6D'
  },
  textSmall: {
    fontSize: 12,
    color: 'black'
  },
  textTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.Griss50,
    marginVertical: 30
  },
  textRight: {
    textAlign: 'right'
  },
  textEm: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  textCenter: {
    textAlign: 'center'
  },
  textError: {
    color: 'red',
    fontSize: 16
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white'
  },
  blueLine: {
    borderBottomColor: colors.Primario500,
    borderBottomWidth: 1
  },
  buttonPrimary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D23D8',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 5,
    height: 50,
    marginVertical: 12
  },
  buttonPrimaryOutline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#404150',
    backgroundColor: '#1C1F24',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '47%',
    height: 50
  },
  buttonError: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.Error500,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  },
  textDecoration: {
    textDecorationLine: 'underline'
  },

  container: {
    padding: 16,
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 10
  },
  contentRow: {
    flexDirection: 'row',
    marginVertical: 5
  },
  inputClabeSpei: {
    borderStyle: 'solid',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: 'rgb(63 63 68 / 5%)',
    marginVertical: 10
  },
  borderGreen: {
    borderStyle: 'solid',
    borderColor: '#84E349',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10
  },
  divider: {
    paddingVertical: 10
  },
  iconCerrar: {
    height: 56,
    paddingRight: 8,
    paddingLeft: 8,
    paddingBottom: 16,
    paddingTop: 16,
    marginHorizontal: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonDisabled: {
    borderColor: '#404150',
    backgroundColor: '#1C1F24',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '85%',
    height: 50
  },
  buttonPrimaryFirstStep: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D23D8',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 5,
    height: 50
  }
})
