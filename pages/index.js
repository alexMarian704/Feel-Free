import styles from '../styles/Home.module.css'

export default function Home({name}) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome {name}</h1>
    </div>
  )
}
