const contactHTML = (name, email, message) =>  `
<!DOCTYPE html>
<head>

</head>
<html style="width: 100%; height: 100%;  align-items: center; padding: 0px; box-sizing: border-box; margin: 0px;">
    <body style="width: 100%; height: 100%; padding: 10px 10px;  align-items: center; justify-content: center; box-sizing: border-box; margin: 0px;">
        <div style="max-width: 500px; height: auto; background-color: rgb(255, 233, 233); border-radius: 10px; border: 0px solid rgba(83, 0, 0, 0.178); margin: 0px; box-sizing: border-box; padding: 20px 0px 15px 0px;">

            <div style="padding: 0px 20px;">
            
                <p style="color: maroon; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0px; padding: 0px 5px; box-sizing: border-box; font-size: 23px; font-weight: 700;">Contact Request</p>
                
                <div style="padding: 15px 19px; margin: 15px 0px 0px 0px; box-sizing: border-box; border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 10px; background: rgba(255, 255, 255, 1);">
                    <p style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: rgb(0, 0, 0); font-weight: 400;">Dear Shaleen<br>Someone named <span style="color: maroon; font-weight: 600;">${name}</span> has sent you a message through your website to contact you. The details are given below.<br><br><span style="color: maroon; font-weight: 500;">You can directly reply to this email to reply to them.</span></p>
                </div>
                <div style="padding: 15px 17px 18px 17px; padding: 5px; margin: 20px 0px 0px 0px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.2); background: rgba(255, 211, 211, 0.5); border-radius: 10px;">
                    <p style="margin: 5px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: maroon; font-weight: 500; padding: 0px 10px;">Name</p>
                    <div style="padding: 10px 15px; margin: 5px 10px 0px 10px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 5px; background: white;">
                        <p style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgb(0, 0, 0); font-weight: 500;">${name}</p>
                    </div>

                    <div style="margin: 15px 0px 10px 0px; box-sizing: border-box; width: calc(100% + 10px); position: relative; left: -5px; background: rgba(83, 0, 0, 0.1); height: 0px;"></div>

                    <p style="margin: 0px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: maroon; font-weight: 500; padding: 0px 10px;">Email</p>
                    <div style="padding: 10px 15px; margin: 5px 10px 0px 10px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 5px; background: white;">
                        <a style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgb(94, 0, 0); font-weight: 500; text-decoration: none;" href="mailto:${email}">${email}</a>
                    </div>

                    <div style="margin: 15px 0px; box-sizing: border-box; width: calc(100% + 10px); position: relative; left: -5px; background: rgba(83, 0, 0, 0.1); height: 1px; height: 0px;"></div>

                    <p style="margin: -5px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: maroon; font-weight: 500; padding: 0px 10px;">Message</p>
                    <div style="padding: 10px 15px; margin: 5px 10px 10px 10px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 5px; background: white;">
                        <p style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgb(0, 0, 0); font-weight: 400;">${message}</p>
                    </div>
                </div>

                <p style="color: maroon; padding: 0px; box-sizing: border-box; margin: 20px 5px 0px 5px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: 500; font-size: 14px; align-self: center; text-align: center;">You can directly reply to this mail to reply to them</p>

                <a style="margin: 40px 0px 0px 0px; box-sizing: border-box; padding: 0px; align-items: center; text-decoration: none;" href="https://shaleen.net/">
                    <p style="margin: 0px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgba(128, 0, 0, .7); font-size: 14px; font-weight: 700;">shaleen.net</p>
                </a>

            </div>

            <div style="margin: 40px 0px 0px 0px; box-sizing: border-box; padding: 0px 15px; align-items: flex-start;">
                <p style="margin: 0px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgba(128, 0, 0, 0.4); font-size: 9.5px; font-weight: 500; margin: 0px 0px 0px 0px; opacity: 0;">Patel Hall of Residence, IIT Kharagpur, Kharagpur, West Bengal - 721302</p>
                <p style="padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgba(128, 0, 0, 0.4); font-size: 9.5px; font-weight: 500; margin: 5px 0px 0px 0px; user-select: none;">(C) Copyright <span style="color: maroon;">Shaleen Singh</span> 2025-Present. All Rights Reserved.</p>
            </div>
        </div>
    </body>
</html>
`

const contactRHTML = (name, email, message) => `
<!DOCTYPE html>
<head>

</head>
<html style="width: 100%; height: 100%;  align-items: center; padding: 0px; box-sizing: border-box; margin: 0px;">
    <body style="width: 100%; height: 100%; padding: 10px 10px;  align-items: center; justify-content: center; box-sizing: border-box; margin: 0px;">
        <div style="max-width: 500px; height: auto; background-color: rgb(255, 233, 233); border-radius: 10px; border: 0px solid rgba(83, 0, 0, 0.178); margin: 0px; box-sizing: border-box; padding: 20px 0px 15px 0px;">

            <div style="padding: 0px 20px;">
            
                <p style="color: maroon; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0px; padding: 0px 5px; box-sizing: border-box; font-size: 23px; font-weight: 700;">Contact Request Sent</p>
                
                <div style="padding: 15px 19px; margin: 15px 0px 0px 0px; box-sizing: border-box; border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 10px; background: rgba(255, 255, 255, 1);">
                    <p style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: rgb(0, 0, 0); font-weight: 400;">Dear <span style="font-weight: 500;">${name}</span><br>Your message has been sent to <span style="color: maroon; font-weight: 600;">Shaleen</span> in her mail.</span><br><br><span style="color: maroon; font-weight: 500;">Below is a copy of your responses.</span></p>
                </div>
                <div style="padding: 15px 17px 18px 17px; padding: 5px; margin: 20px 0px 0px 0px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.2); background: rgba(255, 211, 211, 0.5); border-radius: 10px;">
                    <p style="margin: 5px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: maroon; font-weight: 500; padding: 0px 10px;">Name</p>
                    <div style="padding: 10px 15px; margin: 5px 10px 0px 10px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 5px; background: white;">
                        <p style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgb(0, 0, 0); font-weight: 500;">${name}</p>
                    </div>

                    <div style="margin: 15px 0px 10px 0px; box-sizing: border-box; width: calc(100% + 10px); position: relative; left: -5px; background: rgba(83, 0, 0, 0.1); height: 0px;"></div>

                    <p style="margin: 0px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: maroon; font-weight: 500; padding: 0px 10px;">Email</p>
                    <div style="padding: 10px 15px; margin: 5px 10px 0px 10px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 5px; background: white;">
                        <a style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgb(94, 0, 0); font-weight: 500; text-decoration: none;" href="mailto:${email}">${email}</a>
                    </div>

                    <div style="margin: 15px 0px; box-sizing: border-box; width: calc(100% + 10px); position: relative; left: -5px; background: rgba(83, 0, 0, 0.1); height: 1px; height: 0px;"></div>

                    <p style="margin: -5px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: maroon; font-weight: 500; padding: 0px 10px;">Message</p>
                    <div style="padding: 10px 15px; margin: 5px 10px 10px 10px; box-sizing: border-box;  border: 0px solid rgba(83, 0, 0, 0.178); border-radius: 5px; background: white;">
                        <p style="margin: 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgb(0, 0, 0); font-weight: 400;">${message}</p>
                    </div>
                </div>

                <p style="color: maroon; padding: 0px; box-sizing: border-box; margin: 20px 5px 0px 5px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: 500; font-size: 14px; align-self: center; text-align: center;">You cannot reply to this mail. It is just a receipt</p>

                <a style="margin: 40px 0px 0px 0px; box-sizing: border-box; padding: 0px; align-items: center; text-decoration: none;" href="https://shaleen.net/">
                    <p style="margin: 0px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgba(128, 0, 0, .7); font-size: 14px; font-weight: 700;">shaleen.net</p>
                </a>

            </div>

            <div style="margin: 40px 0px 0px 0px; box-sizing: border-box; padding: 0px 15px; align-items: flex-start;">
                <p style="margin: 0px 0px 0px 0px; padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgba(128, 0, 0, 0.4); font-size: 9.5px; font-weight: 500; margin: 0px 0px 0px 0px; opacity: 1;">Patel Hall of Residence, IIT Kharagpur, Kharagpur, West Bengal - 721302</p>
                <p style="padding: 0px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: rgba(128, 0, 0, 0.4); font-size: 9.5px; font-weight: 500; margin: 5px 0px 0px 0px; user-select: none;">(C) Copyright <span style="color: maroon;">Shaleen Singh</span> 2025-Present. All Rights Reserved.</p>
            </div>
        </div>
    </body>
</html>
`

module.exports = {
    contactHTML, contactRHTML
}