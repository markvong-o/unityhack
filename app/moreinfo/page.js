'use client';
import styles from './styles.module.css';
import { useState } from 'react';

import { completeForm } from './actions';

export default function MoreInfo(context) {
  let { state, domain, accepted_terms } = context.searchParams;
  let [firstname, setFirstname] = useState(
    context.searchParams.firstname !== 'undefined'
      ? context.searchParams.firstname
      : ''
  );
  let [terms, setTerms] = useState(accepted_terms === 'true' || false);
  console.log(terms);
  return (
    <div className={styles.formDiv}>
      <h1>Unity</h1>
      <h2>Hi, please tell us a little more about yourself...</h2>
      <form className={styles.form} action={completeForm}>
        <div className={styles.formField}>
          <label htmlFor="firstname" className={styles.label}>
            First Name
          </label>
          <input
            name="firstname"
            id="firstname"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className={styles.fieldInput}
            required
          ></input>
        </div>
        <div className={styles.formField}>
          <label htmlFor="terms" className={styles.label}>
            Terms and Conditions
          </label>
          <input
            name="terms"
            type="checkbox"
            value={terms}
            id="terms"
            checked={terms}
            className={styles.fieldInput}
            onChange={(e) => setTerms(e.target.checked)}
          ></input>
        </div>
        <input name="state" hidden readOnly value={state} />
        <input name="domain" hidden readOnly value={domain} />
        <input type="submit" class={styles.submit}></input>
      </form>
    </div>
  );
}
