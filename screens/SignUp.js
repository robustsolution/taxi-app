import React, { Component } from 'react'
import { Text, StyleSheet, View, Platform, Alert, Image } from 'react-native'
import SignUpForm from '../components/SignUpForm'
import Login from './Login'
import axios from 'axios'
import LinearGradient from 'react-native-linear-gradient'
import { baseURL } from '../baseUrl'
axios.defaults.baseURL = baseURL

export default class SignUp extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            errorMessage: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSignUp = this.handleSignUp.bind(this)
    }

    handleChange(name, value) {
        this.setState({
            [name]: value
        })
    }

    async handleSignUp() {
        try {
            const { firstName, lastName, email, password } = this.state
            const result = await axios.post('/auth/signup', { firstName, lastName, email, password })
            this.props.handleChange('createAccount', false)
        } catch (error) {
            const errorMessage = error.response.data.message
            Alert.alert('', errorMessage)
        }
    }

    render() {
        return (
            <LinearGradient
                colors={['#1C55BB', '#9999DF']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerText}>WeTaxi </Text>
                <SignUpForm
                    firstName={this.state.firstName}
                    lastName={this.state.lastName}
                    email={this.state.email}
                    password={this.state.password}
                    handleChange={this.handleChange}
                    handleSignUp={this.handleSignUp}
                />
                <Text>{this.state.errorMessage}</Text>
                <Image
                    source={require('../images/wetaxi.png')}
                    style={styles.logo}
                />

            </LinearGradient>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerText: {
        fontSize: 64,
        color: '#FFF',
        textAlign: 'center',
        marginTop: 180,
        marginBottom: 40
    },
    errorMessage: {
        marginHorizontal: 10,
        fontSize: 18,
        color: '#fff'
    },
    logo: {
        //flex: 1,
        marginTop: 100,
        height: 100,
        width: 100,
        alignSelf: 'center',
    }
});
