import { useEffect, useRef, useState } from "react";

interface ErrorMsg {
    phoneNum: string;
    code: string;
}

const ErrorDefault: ErrorMsg = {
    phoneNum: '',
    code: ''
}

const ErrorMessage = ({text} : {text: string}) => {
    if (!text.length)
        return;
    return (
        <p className="error">{text}</p>
    )
}

const PhonePage = () => {
    const enteredCode = (phoneStr: string) => {
        fetch('https://juniorsbootcamp.ru/api/users/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phoneStr,
                code: Number(code)
            })
        })
        .then((res) => {
            if (buttonRef.current) {
                buttonRef.current.disabled = false;
                setButtonText("Войти");
            }
            return res.json()
        })
        .then((data)=> {
            console.log(data)
            if (data.success) {
                console.log('success singin!')
            } else {
                console.log(data.reason)
            }
        })
    }
    const enteredPhone = (phoneStr: string) => {
        fetch('https://juniorsbootcamp.ru/api/auth/otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phoneStr
            })
        }).then((res) => {
            if (buttonRef.current) {
                buttonRef.current.disabled = false;
                setButtonText("Войти");
            }
            setCodeSent(true);
            return res.json()
        })
        .then((data) => {
            if (data.success) {
                if (resendRef.current) {
                    resendRef.current.disabled = true;
                    resendRef.current.hidden = false;
                }
                setTime(data.retryDelay);
            }
            
        })
    }

    const enteredInput = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        let errors: ErrorMsg = {...ErrorDefault};
        let phoneStr: string = phoneNum.replaceAll(' ', '');
        if (phoneStr.length == 0) {
            errors.phoneNum = "Поле является обязательным для заполнения"
        }
        if (codeSent && code.length < 6) {
            errors.code = "Код должен содержать 6 цифр"
        }
        if (errors.code.length || errors.phoneNum.length) {
            setErrors(errors);
            return;
        }
        if (buttonRef.current) {
            buttonRef.current.disabled = true;
            setButtonText("Подождите...");
        }

        if (!codeSent) {
            enteredPhone(phoneStr)
        } else {
            enteredCode(phoneStr)
        }
    }

    const checkPhonePattern = (text: string) => {
        text = text.replaceAll(' ', '')
        let phone: string = ''
        let phoneForm: string = ''
        let total: number = 0;
        text.split("").map((char: string) => {
            if (char >= '0' && char <= '9') {
                phone += char
                total += 1
            }
        })
        phone.split('').forEach((char: string, indx: number) => {
            phoneForm += char
            
            if (total - indx == 5 ||
                 total - indx == 8 || total - indx == 11) {
                phoneForm += ' '
            }
        })
        setPhoneNum(phoneForm)
        if (phone.length > 0 && errors.phoneNum.length) {
            setErrors((prev) => ({
                ...prev,
                phoneNum: ''
            }));
        }
    }
    const checkCodePattern = (text: string) => {
        const chars: string[] = text.split("");
        let code: string = ''
        let cnt = 0
        chars.map((char: string) => {
            if (cnt < 6 && char >= '0' && char <= '9') {
                code += char
                cnt += 1
            }
        })
        setCode(code)
        if (code.length == 6 && errors.code.length) {
            setErrors((prev) => ({
                ...prev,
                code: ''
            }));
        }
    }

    const buttonRef = useRef<HTMLButtonElement>(null);
    const resendRef = useRef<HTMLButtonElement>(null);
    const [codeSent, setCodeSent] = useState(false);
    const [buttonText, setButtonText] = useState('Продолжить');
    const [phoneNum, setPhoneNum] = useState('');
    const [code, setCode] = useState('');
    const [errors, setErrors] = useState<ErrorMsg>({...ErrorDefault});
    const [time, setTime] = useState(0);

    useEffect(() => {
        if (time > 0) {
            setTimeout(() => {
                setTime(time - 1000)
            }, 1000)
        } else {
            if (resendRef.current) {
                resendRef.current.disabled = false;
            }
        }

    }, [time])

    return (
        <div className="phonePage">
            <div className="container">
                <h1>Вход</h1>
                <p>Введите номер телефона для входа в личный кабинет</p>
                <form onSubmit={enteredInput}>
                    <input 
                        placeholder="Номер телефона"
                        value={phoneNum}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => checkPhonePattern(e.target.value)}
                    />
                    <ErrorMessage text={errors.phoneNum} />
                    {
                    codeSent && 
                    <>
                    <input 
                        placeholder="Проверочный код"
                        value={code}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => checkCodePattern(e.target.value)}
                    />
                    <ErrorMessage text={errors.code} />
                    </>
                    }
                    <button className="enter-button" ref={buttonRef}>{buttonText}</button>
                </form>
                <button 
                    className="resend-code" 
                    // disabled={true} 
                    ref={resendRef} 
                    hidden={true}
                    onClick={() => {
                        enteredPhone(phoneNum.replaceAll(' ', ''))}}>
                    {
                        time > 0 ? `Запросить код повторно можно будет через ${time/1000} секунд` : "Запросить код повторно"
                    }
                </button>
            </div>
        </div>
    )
}

export default PhonePage;