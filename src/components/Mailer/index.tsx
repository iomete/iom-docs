import React, { useRef, useState } from "react";

import axios from "axios";

import styles from "./styles.module.scss";

const url =
  "https://assets.mailerlite.com/jsonp/1088246/forms/131631455744821036/subscribe?fields[email]=";

const Mailer = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const subscribe = () => {
    if (!inputRef.current) return;

    const email = inputRef.current.value;
    const getUrl = url + encodeURIComponent(email);

    setLoading(true);

    axios.get(getUrl).then(function (response) {
      setLoading(false);
      if (response.data.success) {
        setIsSuccess(true);
        inputRef.current!.value = "";
      }
    });
  };

  return (
    <div className={`card ${styles.Parent}`}>
      <h4 className={styles.H4}>
        Sign Up for Product Updates and Release Notes
      </h4>
      <p className={styles.P}>
        You'll receive notifications about new features, improvements, and
        important updates.
      </p>
      <form
        action="#"
        onSubmit={(event) => {
          event.preventDefault();
          subscribe();
        }}
      >
        <div className={styles.FormContent}>
          <input
            className={styles.Input}
            ref={inputRef}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Your email"
          />
          <button
            type="submit"
            className={`button button--primary ${styles.Button}`}
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </form>

      {!isSuccess && <p className={styles.NoSpam}>Unsubscribe at any time.</p>}

      {isSuccess && <p className={styles.Thanks}>Thanks for subscribing.</p>}
    </div>
  );
};

export default Mailer;
