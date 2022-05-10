import { useRef, useContext, useState } from "react";
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import Context from "../../context";

function SignUp(props) {
  const { toggleModal } = props;

  const { cometChat, setIsLoading } = useContext(Context);

  const firstnameRef = useRef(null);
  const lastnameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const filepickerRef = useRef(null);

  const [userAvatar, setUserAvatar] = useState(null);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);

  const getInputs = () => {
    const firstname = firstnameRef.current.value;
    const lastname = lastnameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    return { firstname, lastname, email, password, confirmPassword };
  }

  const isSignupValid = ({ firstname, lastname, email, password, confirmPassword }) => {
    if (!userAvatar) {
      alert("Please upload your avatar");
      return false;
    }
    if (validator.isEmpty(firstname)) {
      alert("Please input your firstname");
      return false;
    }

    if (validator.isEmpty(lastname)) {
      alert("Please input your lastname");
      return false;
    }
    if (!validator.isEmail(email)) {
      alert("Please input your email");
      return false;
    }
    if (validator.isEmpty(password) || !validator.isLength(password, { min: 6 })) {
      alert("Please input your password. You password must have at least 6 characters");
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      alert("Please input your confirm password");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Confirm password and password must be the same");
      return false;
    }
    return true;
  };

  const createFormData = ({ userUuid, email, password, firstname, lastname }) => {
    const formData = new FormData();
    formData.append('avatar', uploadedAvatar);
    formData.append('id', userUuid);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    return formData;
  }

  const createUser = async ({ userUuid, email, password, firstname, lastname }) => {
    const url = 'http://localhost:8080/users/create';
    const formData = createFormData({ userUuid, email, password, firstname, lastname });
    return await axios.post(url, formData);
  };

  const createCometChatAccount = async ({ userUuid, firstname, avatar }) => {
    const authKey = `${process.env.REACT_APP_COMETCHAT_AUTH_KEY}`;
    const user = new cometChat.User(userUuid);
    user.setName(firstname);
    user.setAvatar(avatar);
    return await cometChat.createUser(user, authKey);
  };

  const signup = async () => {
    const { firstname, lastname,  email, password, confirmPassword } = getInputs();
    if (isSignupValid({ firstname,lastname, email, password, confirmPassword })) {
      setIsLoading(true);
      const userUuid = uuidv4();
      const response = await createUser({ userUuid, email, password, firstname, lastname });
      if (response && response.data.message) { 
        alert(response.data.message);
      } else {
        const createdAccount = await createCometChatAccount({ userUuid, firstname, avatar: `http://localhost:8080/${response.data.avatar}` });
        if (createdAccount) {
          alert(`${email} was created successfully! Please sign in with your created account`);
        }
      }
      toggleModal(false);
      setIsLoading(false);
    }
  };

  const removeUserAvatar = () => {
    filepickerRef.current.value = null;
    setUserAvatar(null);
    setUploadedAvatar(null);
  };

  const addUserAvatar = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      setUploadedAvatar(e.target.files[0]);
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setUserAvatar(readerEvent.target.result);
    };
  };

  return (
    <div className="signup">
      <div className="signup__content">
        <div className="signup__container">
          <div className="signup__title">Sign Up</div>
          <div className="signup__close">
            <img
              alt="close"
              onClick={() => toggleModal(false)}
              src="https://static.xx.fbcdn.net/rsrc.php/v3/y2/r/__geKiQnSG-.png"
            />
          </div>
        </div>
        <div className="signup__subtitle"></div>
        <div className="signup__form">
          {userAvatar && <div className="signup__user-avatar">
            <div>
              <img src={userAvatar} alt="user-avatar" />
              <svg onClick={removeUserAvatar} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>}
          {!userAvatar && <div onClick={() => filepickerRef.current.click()} className="signup__avatar-picker">Choose File</div>}
          <input
            style={{ display: 'none' }}
            onChange={addUserAvatar}
            ref={filepickerRef}
            type="file"
            hidden
          />
          <input type="text" placeholder="Fulllname" ref={firstnameRef} />
          <input type="text" placeholder="Email" ref={emailRef} />
          <input type="password" placeholder="Password" ref={passwordRef} />
          <input
            type="password"
            placeholder="Confirm Password"
            ref={confirmPasswordRef}
          />
          <button className="signup__btn" onClick={signup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
