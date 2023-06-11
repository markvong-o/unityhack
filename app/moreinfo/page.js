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
    <form className={styles.form} action={completeForm}>
      <label htmlFor="firstname">First Name</label>
      <input
        name="firstname"
        id="firstname"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
        required
      ></input>
      <label htmlFor="terms">Terms and Conditions</label>
      <input
        name="terms"
        type="checkbox"
        value={terms}
        id="terms"
        checked={terms}
        onChange={(e) => setTerms(e.target.checked)}
      ></input>
      <input name="state" hidden readOnly value={state} />
      <input name="domain" hidden readOnly value={domain} />
      <input type="submit"></input>
    </form>
  );
}
