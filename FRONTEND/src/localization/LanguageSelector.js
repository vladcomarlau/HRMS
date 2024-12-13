import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector(props) {
    //darkmode = bool
    const [language, setLanguage] = useState("ro");
    const { i18n } = useTranslation();

    useEffect(() => {
        if(localStorage.getItem("language") != undefined) {
            setLanguage(localStorage.getItem("language"));
            i18n.changeLanguage(localStorage.getItem("language"));
        } else {
            setLanguage("ro");
            i18n.changeLanguage("ro");
        }
    }, [])

    const executeLanguage = (x) => {
        setLanguage(x);
        i18n.changeLanguage(x);
        localStorage.setItem("language", x);
    }

    const handleSetLanguage = () => {
        if (language === "ro") {
            executeLanguage("en");
        } else {
            executeLanguage("ro");
        }
    }

    return (
        <div
            className = {props.darkmode ? "rounded-pill mx-2 my-1 text-center languageButton border-dark-subtle"
            : "rounded-pill mx-2 my-1 text-center pt-1 languageButton"}
            style={{margin:"auto", width:"50px", cursor:"pointer"}}
            onClick={() => handleSetLanguage()}>
            {language === "ro" ? 
                <span class="fi fi-ro"></span> 
                : 
                <span class="fi fi-us"></span>}
        </div>
    )
}