#! /usr/bin/env node
import inquirer from "inquirer";
import { colors, printColoredMessage } from "./coloredPrint.js";
let name;
let pin;
let loginPin;
let balance;
let attempts = 0;
let accountNumber;
let history_data = [];
const authFlow = [
    {
        name: "Signup",
    },
    {
        name: "Login",
    },
];
// After Login functions
const _profileData = [
    {
        name: "changeName",
        function: async () => await changeName(),
    },
    {
        name: "changePin",
        function: async () => await changePin(),
    },
    {
        name: "withdrawamount",
        function: async () => await withdrawamount(),
    },
    {
        name: "depositAmount",
        function: async () => await deposit(),
    },
    {
        name: "seeHistory",
        function: async () => await seeHistory(),
    },
    {
        name: "logout",
        function: async () => await Atm(true),
    },
];
// Update User Name
const changeName = async () => {
    let _name = await askName("Enter your new userName :");
    name = _name;
    printColoredMessage(`New Name has updated successfully your new username is ${colors.yellow}${_name}${colors.reset}`);
    getProfileData();
};
// Change PIN CODE
const changePin = async () => {
    let _pin = await resetPin();
    pin = _pin;
    printColoredMessage(`New Pin has updated successfully your new Pin is ${colors.yellow}${_pin}${colors.reset}`);
    getProfileData();
};
// Withdraw Amount
const withdrawamount = async () => {
    let _amount = await performTransaction("Please enter the amount to withdraw", "withdraw");
    balance -= _amount;
    history_data.push({ amountType: "Withdraw", id: history_data.length + 1, amount: _amount });
    getProfileData();
};
// Deposit Amount
const deposit = async () => {
    let _amount = await performTransaction("Please enter the amount to deposit", "deposit");
    console.log("_amount", _amount);
    balance += Number(_amount);
    history_data.push({ amountType: "Deposit", id: history_data.length + 1, amount: _amount });
    getProfileData();
};
// See Transaction history
const seeHistory = async () => {
    let see = await inquirer.prompt([{ message: printHistoryData(history_data), name: "goBack", type: "confirm" }]).
        then(val => getProfileData());
};
const printHistoryData = (data) => {
    if (data.length === 0) {
        printColoredMessage("No transactions to display", "orange");
        return;
    }
    // Print table headers
    printColoredMessage("| ID | Amount | Type     |", "yellow");
    printColoredMessage("|----|--------|----------|", "yellow");
    // Print data rows
    data.forEach(entry => {
        const amountColor = entry.amountType === "Withdraw" ? "red" : "green";
        printColoredMessage(`| ${entry.id}  | ${entry.amount}      | ${entry.amountType.padEnd(8)} |`, amountColor);
    });
};
let newBalance;
const performTransaction = async (message, transactionType) => {
    if (transactionType == "withdraw") {
        newBalance = await inquirer.prompt([
            {
                message: message,
                type: "number",
                name: "balance",
                validate: function (input) {
                    if (isNaN(input) || input > balance) {
                        return "Please enter correct balance";
                    }
                    if (input > balance) {
                        return "insufficient balance !";
                    }
                    return true;
                },
                filter: function (input) {
                    if (isNaN(input) || input > balance) {
                        return undefined; // Clear input
                    }
                    return input;
                },
            },
        ]);
    }
    else if (transactionType == "deposit") {
        newBalance = await inquirer.prompt([
            {
                message: message,
                type: "number",
                name: "balance",
                validate: function (input) {
                    if (isNaN(input) || input < 1) {
                        return "Please enter correct amount";
                    }
                    if (input > 100000) {
                        return "limit exceed , limit: 6 figure amount";
                    }
                    return true;
                },
                filter: function (input) {
                    if (isNaN(input) || input > 100000) {
                        return undefined; // Clear input
                    }
                    return input;
                },
            },
        ]);
    }
    return newBalance.balance;
};
const getProfileData = async () => {
    printAfterLoginMessage();
    printColoredMessage(`Welcome back ${name} here you can change passcode,name perform transactions and see history`, "green");
    let option = await inquirer.prompt([
        {
            message: "Enter operation ",
            type: "list",
            choices: _profileData,
            name: "choice",
        },
    ]);
    let selectedOption = _profileData.find((val) => val.name == option.choice);
    selectedOption?.function();
};
const askName = async (message) => {
    let _name = await inquirer.prompt([
        {
            message: message || "Enter your Name here :",
            type: "string",
            name: "name",
            validate: function (input) {
                if (!input || input.length < 3) {
                    return "Please enter a valid Name.";
                }
                return true;
            },
            filter: function (input) {
                if (!input || input.length < 3) {
                    return undefined; // Clear input
                }
                return input;
            },
        },
    ]);
    return _name?.name;
};
const askPin = async () => {
    let pin = await inquirer.prompt([
        {
            message: "Set your PinCode",
            type: "string",
            name: "pin",
            validate: function (input) {
                if (isNaN(input) || input.length < 6) {
                    return "Please enter a valid pin. minimum pin lenght is 6";
                }
                return true;
            },
            filter: function (input) {
                if (isNaN(input) || input.length < 6) {
                    return undefined; // Clear input
                }
                return input;
            },
        },
    ]);
    return pin?.pin;
};
const askLoginPin = async () => {
    let _pin = await inquirer.prompt([
        {
            message: "Enter your PinCode",
            type: "string",
            name: "pin",
            validate: function (input) {
                if (isNaN(input) || input.length < 6) {
                    return "Please enter a valid pin.";
                }
                return true;
            },
            filter: function (input) {
                if (isNaN(input) || input.length < 6) {
                    return undefined; // Clear input
                }
                return input;
            },
        },
    ]);
    loginPin = _pin.pin;
    return _pin.pin == pin;
};
const resetPin = async () => {
    let _pin = await inquirer.prompt([
        {
            message: "Enter your New PinCode",
            type: "number",
            name: "pin",
            validate: function (input) {
                if (isNaN(input) || input.length < 6) {
                    return "Please enter a valid pin.";
                }
                return true;
            },
        },
    ]);
    let _pin2 = await inquirer.prompt([
        {
            message: "Confirm your PinCode",
            type: "number",
            name: "pin2",
            validate: function (input) {
                if (input !== _pin.pin) {
                    return "Please enter a same pin.";
                }
                return true;
            },
        },
    ]);
    pin = _pin2.pin;
    return _pin2.pin;
};
const askBalance = async () => {
    let _balance = await inquirer.prompt([
        {
            message: "Please enter your balance. Limit:100,000",
            type: "string",
            name: "balance",
            validate: function (input) {
                if (isNaN(input) || input > 100000) {
                    return "Please enter correct balance. Limit:100,000";
                }
                return true;
            },
            filter: function (input) {
                if (isNaN(input) || input > 100000) {
                    return undefined; // Clear input
                }
                return input;
            },
        },
    ]);
    return _balance.balance;
};
const SignUp = async () => {
    name = await askName();
    pin = await askPin();
    balance = await askBalance();
    printColoredMessage("congrats you have created your ATM account.", "green");
};
const Login = async () => {
    printColoredMessage("Login to your account !");
    if (!name) {
        printColoredMessage("Please create your account first !");
        Atm();
    }
    if (name) {
        let askUserName = await askName("Enter username :");
        if (askUserName == name) {
            do {
                let _loginPin = await askLoginPin();
                if (_loginPin) {
                    printColoredMessage("welcome to Furqan's ATM system");
                    const min = Math.pow(10, 7);
                    const max = Math.pow(10, 8) - 1;
                    accountNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                    await getProfileData();
                    return true;
                }
                else {
                    attempts += 1;
                    printColoredMessage(`You entered wrong pin. remaining ${3 - attempts} out of 3`, "yellow");
                    continue;
                }
            } while (loginPin !== pin && attempts !== 3);
            if (loginPin !== pin) {
                let isResetPin = await inquirer.prompt([
                    {
                        message: "you have exceed the attempts limit do you want to Reset the PIN?",
                        type: "confirm",
                        name: "resetPin",
                    },
                ]);
                if (isResetPin.resetPin) {
                    await resetPin();
                }
            }
        }
        else {
            printColoredMessage(`username ${askUserName} not found`);
            Login();
        }
    }
};
const printAfterLoginMessage = () => {
    const time = new Date;
    const formattedTime = getFormattedTodayTime(time.getHours(), time.getMinutes()); // 8 PM
    console.log(); // Empty line for spacing
    const userDetails = `
      Name: ${name}
      Account Number: ${accountNumber}
      Balance: Rs:${balance}
      Last Login: ${formattedTime}
  `;
    // Last Login: ${"user.lastLogin"}
    console.log(userDetails);
    console.log(); // Empty line for spacing
    printColoredMessage("************************************************", "green");
};
const Atm = async (singedUp) => {
    if (!singedUp) {
        printColoredMessage(`********** Welcome to Furqan's Banking App **********`, "green");
        const appFeatures = `
  Features:
  - Signup
  - Login
  - Proper validation on signup
  - Login with username and PIN
  - PIN has attempt limit (three attempts)
  - Set amount
  - After login, can view:
      - Name
      - Account number
      - Last login
      - Balance
  - Can change PIN
  - Can change name
  - Can perform transactions (withdraw and deposit)
  - Can view transaction history
  - Can logout
`;
        console.log(appFeatures);
    }
    if (singedUp) {
        await Login();
        return;
    }
    let auth = await inquirer.prompt([
        {
            name: "authFlow",
            type: "list",
            choices: authFlow,
        },
    ]);
    if (auth.authFlow == "Signup") {
        await SignUp().then((el) => Atm((singedUp = true)));
    }
    else {
        await Login();
    }
};
Atm();
// Function to get the formatted date and time
const getFormattedTodayTime = (hours, minutes) => {
    const now = new Date();
    now.setHours(hours, minutes, 0, 0); // Set the time to the provided hours and minutes
    const formattedHours = now.getHours();
    const period = formattedHours >= 12 ? 'PM' : 'AM';
    const formattedMinutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${formattedHours % 12 || 12}:${formattedMinutes} ${period}`;
    return `Today at ${formattedTime}`;
};
