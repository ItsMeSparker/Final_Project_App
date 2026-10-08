import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    // Head Styles
    headContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headText: {
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
        textDecorationColor: '#008631'
    },
    
    // Normal Styles
    normalContainer:{
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    normalText: {
        fontSize: 10,
        fontWeight: '400',
        textAlign: 'center',
    },
    normalButton: {
        width: 90 * 4,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5E6A9',
        margin: 20,
        borderRadius: 40, // (Simplified your radius code!)
    },
});