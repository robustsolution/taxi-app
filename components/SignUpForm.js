import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native'

export default class SignUpForm extends Component {
    render() {
        return (
            <View>
                <TextInput
                    style={styles.input}
                    placeholder='First Name'
                    autoCapitalize={'words'}
                    autoCorrect={false}
                    placeholderTextColor='grey'
                    value={this.props.firstName}
                    onChangeText={(firstName) => this.props.handleChange('firstName', firstName)}
                />
                <TextInput
                    style={styles.input}
                    placeholder='Last Name'
                    autoCapitalize={'words'}
                    autoCorrect={false}
                    placeholderTextColor='grey'
                    value={this.props.lastName}
                    onChangeText={(lastName) => this.props.handleChange('lastName', lastName)}
                />
                <TextInput
                    style={styles.input}
                    placeholder='your@email.com'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    placeholderTextColor='grey'
                    value={this.props.email}
                    onChangeText={(email) => this.props.handleChange('email', email)}
                />
                <TextInput
                    style={styles.input}
                    autoCapitalize='none'
                    autoCorrect={false}
                    secureTextEntry
                    placeholder='password'
                    placeholderTextColor='grey'
                    value={this.props.password}
                    onChangeText={(password) => this.props.handleChange('password', password)}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.props.handleSignUp}
                >
                    <Text style={styles.buttonText}>Create account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.create}
                    onPress={this.props.handleSignUp}

                >
                    <Text style={styles.create}>I have an account</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        padding: 5,
        marginBottom: 10,
        marginRight: 30,
        marginLeft: 30,
        backgroundColor: 'white',
        color: 'black',
        textAlign: 'center',
        fontSize: 17,
        borderRadius: 20
    },
    button: {
        borderRadius: 20,
        backgroundColor: '#562EAC',
        paddingVertical: 10,
        marginVertical: 10,
        marginRight: 30,
        marginLeft: 30,

    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 25,
        fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
        fontWeight: '200',
    },
    create: {
        color: 'black',
        textAlign: 'center',
        fontSize: 25,
        fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
        fontWeight: '200',
    }
})
