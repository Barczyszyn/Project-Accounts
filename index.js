import _ from 'lodash';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';

const log = console.log;

operationAccount();

function operationAccount() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'actionAccount',
            message: 'Digite uma ação:',
            choices: ['Criar Conta', 'Consultar Conta', 'Sair']
        },
    ])
        .then((answer) => {
            const actionAccount = answer['actionAccount'];

            if (actionAccount === 'Criar Conta') {
                welcome();
            } else if (actionAccount === 'Consultar Conta') {
                searchAccount();
            } else if (actionAccount === 'Sair') {
                console.clear();
                log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                process.exit();
            }
        })
        .catch((err) => log(err))
}

function welcome() {
    log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
    log(chalk.green('Defina as opções da sua conta a seguir:'));
    createAccount()
}

function createAccount() {
    inquirer.prompt([
        {
            name: 'userName',
            message: 'Digite seu nome:'
        },
        {
            type: "password",
            name: 'userPass',
            message: 'Digite sua senha:'
        },
        {
            type: "password",
            name: 'userPassConfirm',
            message: 'Digite novamente sua senha:'
        }
    ])
        .then((answer) => {
            const userName = _.startCase(_.toLower(answer['userName']));

            const userPass = answer['userPass'];
            const userPassConfirm = answer['userPassConfirm'];

            if (userPass === userPassConfirm) {
                if (!fs.existsSync('accounts')) {
                    fs.mkdirSync('accounts');
                }

                if (fs.existsSync(`accounts/${userName}.json`)) {
                    log(chalk.bgRed.black('Conta já existente!'));
                    setTimeout(() => {
                        console.clear();
                        createAccount();
                    }, 2000)
                    return
                }

                const data = `{"password":"${userPass}","balance": 0}`;

                fs.writeFileSync(`accounts/${userName}.json`, data, function (err) { log(err) });

                log(chalk.bgGreen.black('Conta incluída com sucesso!'));
                setTimeout(() => {
                    console.clear();
                    operationAccount();
                }, 2000);
            } else {
                log(chalk.bgRed.black('Senha inválida!'));
                setTimeout(() => {
                    console.clear();
                    createAccount();
                }, 2000)
                return
            }
        })
        .catch((err) => log(err))
}

function searchAccount() {
    inquirer.prompt([
        {
            name: 'userName',
            message: 'Digite seu nome:'
        },
        {
            type: "password",
            name: 'userPass',
            message: 'Digite sua senha:'
        }
    ])
        .then((answer) => {
            const userName = _.startCase(_.toLower(answer['userName']));
            const userPass = answer['userPass'];

            if (fs.existsSync('accounts')) {
                if (fs.existsSync(`accounts/${userName}.json`)) {
                    const file = fs.readFileSync(`accounts/${userName}.json`);
                    const data = JSON.parse(file);
                    const password = data.password;
                    if (userPass === password) {
                        console.clear();
                        accountOperations(userName);
                    } else {
                        log(chalk.bgRed.black('Senha inválida!'));
                        setTimeout(() => {
                            console.clear();
                            searchAccount();
                        }, 2000)
                        return
                    }
                } else {
                    log(chalk.bgRed.black('Conta inexistente!'));
                    setTimeout(() => {
                        console.clear();
                        searchAccount();
                    }, 2000)
                    return
                }
            } else {
                log(chalk.bgRed.black('Conta inexistente!'));
                setTimeout(() => {
                    console.clear();
                    operationAccount();
                }, 2000)
                return
            }
        })
        .catch((err) => log(err))
}

function accountOperations(userName) {
    inquirer.prompt([
        {
            type: 'list',
            name: 'operationAccount',
            message: 'Digite uma ação: ',
            choices: ['Consultar Saldo', 'Depositar', 'Sacar', 'Transferir', 'Sair']
        },
    ])
        .then((answer) => {
            const operationAccount = answer['operationAccount'];

            if (operationAccount === 'Consultar Saldo') {
                getAccountBalance(userName);
            } else if (operationAccount === 'Depositar') {
                deposit(userName);
            } else if (operationAccount === 'Sacar') {
                withdraw(userName);
            } else if (operationAccount === 'Transferir') {
                transfer(userName);
            } else if (operationAccount === 'Sair') {
                console.clear();
                log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                process.exit();
            }
        })
        .catch((err) => log(err))
}

function getAccountBalance(userName) {
    const accountData = getAccount(userName);

    log(chalk.bgBlue.black(`O saldo da sua conta é de RS${accountData.balance}`));
    setTimeout(() => {
        console.clear();
        accountOperations(userName);
    }, 2000)
    return
}

function deposit(userName) {
    inquirer.prompt([
        {
            name: 'amount',
            message: 'Quanto você deseja depositar?'
        },
    ])
        .then((answer) => {
            const amount = answer['amount'];

            addAmount(userName, amount);
        })
        .catch(err => log(err))
}

function addAmount(userName, amount) {
    const accountData = getAccount(userName);

    if (!amount) {
        log(chalk.bgRed.black('Depósito inválido!'));
        setTimeout(() => {
            console.clear();
            deposit(userName);
        }, 2000)
        return
    }

    accountData.balance += parseFloat(amount);

    fs.writeFileSync(
        `accounts/${userName}.json`,
        JSON.stringify(accountData),
        function (err) {
            log(err);
        },
    );

    log(chalk.bgGreen.black(`Depósito no valor de RS${amount} realizado com sucesso!`));
    setTimeout(() => {
        console.clear();
        accountOperations(userName);
    }, 2000);
}

function withdraw(userName) {
    inquirer.prompt([
        {
            name: 'amount',
            message: 'Quanto você deseja sacar?'
        },
    ])
        .then((answer) => {
            const amount = answer['amount'];

            removeAmount(userName, amount);
        })
        .catch(err => log(err))
}

function removeAmount(userName, amount) {
    const accountData = getAccount(userName);

    if (!amount) {
        log(chalk.bgRed.black('Saque inválido!'));
        setTimeout(() => {
            console.clear();
            withdraw(userName);
        }, 2000)
        return
    }

    accountData.balance -= parseFloat(amount);

    fs.writeFileSync(
        `accounts/${userName}.json`,
        JSON.stringify(accountData),
        function (err) {
            log(err);
        },
    );

    log(chalk.bgGreen.black(`Saque no valor de RS${amount} realizado com sucesso!`));
    setTimeout(() => {
        console.clear();
        accountOperations(userName);
    }, 2000);
}

function transfer(userName) {
    inquirer.prompt([
        {
            name: 'account',
            message: 'Para qual conta você deseja transferir?'
        },
    ])
        .then((answer) => {
            const account = answer['account'];

            if (!account) {
                log(chalk.bgRed.black('Conta inválida!'));
                setTimeout(() => {
                    console.clear();
                    transfer(userName);
                }, 2000)
                return
            } else if (account == _.toLower(userName)) {
                log(chalk.bgRed.black('Conta inválida!'));
                setTimeout(() => {
                    console.clear();
                    transfer(userName);
                }, 2000)
                return
            } else {
                if (!fs.existsSync(`accounts/${account}.json`)) {
                    log(chalk.bgRed.black('Conta inexistente!'));
                    setTimeout(() => {
                        console.clear();
                        transfer(userName);
                    }, 2000)
                    return
                } else {
                    const accountData = getAccount(userName);

                    inquirer.prompt([
                        {
                            name: 'amount',
                            message: 'Quanto você deseja transferir?'
                        },
                    ])
                        .then((answer) => {
                            const amount = answer['amount'];

                            if (!amount) {
                                log(chalk.bgRed.black('Valor inválido!'));
                                setTimeout(() => {
                                    console.clear();
                                    transfer(userName);
                                }, 2000)
                                return
                            }

                            if (amount > accountData.balance) {
                                log(chalk.bgRed.black('Valor inválido!'));
                                setTimeout(() => {
                                    console.clear();
                                    transfer(userName);
                                }, 2000)
                                return
                            } else {
                                transferAmount(userName, account, amount);
                            }
                        })
                        .catch(err => log(err))
                }
            }
        })
        .catch(err => log(err))
}

function transferAmount(userName, account, amount) {
    const accountData1 = getAccount(userName);

    accountData1.balance -= parseFloat(amount);

    fs.writeFileSync(
        `accounts/${userName}.json`,
        JSON.stringify(accountData1),
        function (err) {
            log(err);
        },
    );

    const accountData2 = getAccount(account);

    accountData2.balance += parseFloat(amount);

    fs.writeFileSync(
        `accounts/${account}.json`,
        JSON.stringify(accountData2),
        function (err) {
            log(err);
        },
    );

    log(chalk.bgGreen.black(`Transferência no valor de RS${amount} realizado com sucesso!`));
    setTimeout(() => {
        console.clear();
        accountOperations(userName);
    }, 2000);
}

function getAccount(userName) {
    const accountJSON = fs.readFileSync(`accounts/${userName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    });

    return JSON.parse(accountJSON)
}