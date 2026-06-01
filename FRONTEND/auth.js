
console.log("auth.js loaded");


const BASE_URL =
    "http://localhost:3000/api/auth";


async function registerUser() {

    try {

        const name =
            document.getElementById("registerName").value;

        const email =
            document.getElementById("registerEmail").value;

        const password =
            document.getElementById("registerPassword").value;

        console.log(name, email, password);


        const response = await fetch(
            `${BASE_URL}/register`,



            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        console.log(response);

        const data = await response.json();

        console.log(data);


        alert(data.message);

        if (data.success) {

            localStorage.setItem(
                "verifyEmail",
                email
            );

            window.location.href =
                "verify.html";

        }


    



    } catch (error) {

    console.log(error);

}

}





async function loginUser() {

    try {

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        const response = await fetch(

            `${BASE_URL}/login`,

            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        console.log(data);

        alert(data.message);

        if (data.success) {

            localStorage.setItem(
                "mindspaceUser",
                JSON.stringify(data.user)
            );

            window.location.href = "index.html";

        }

    } catch (error) {

        console.log(error);

    }

}

async function verifyOtp() {

    try {

        const email =
            document.getElementById("verifyEmail").value;

        const otp =
            document.getElementById("verifyOtp").value;

        const response = await fetch(

            `${BASE_URL}/verify-otp`,

            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    otp
                })
            }
        );

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            window.location.href =
                "login.html";

        }

    } catch (error) {

        console.log(error);

    }

}


const verifyEmailInput =
  document.getElementById("verifyEmail");

if(verifyEmailInput){

    verifyEmailInput.value =
      localStorage.getItem("verifyEmail");

}
