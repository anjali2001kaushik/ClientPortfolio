export default function Contact({ contact }) {
  return (
    <section className="contact" id="contact">
      <span className="eyebrow">Available For Projects</span>
      <h2>
        {contact.headline1}
        <br />
        <a href={`mailto:${contact.email}`}>{contact.headline2}</a>
      </h2>
      <p className="sub">
        {contact.email} — {contact.responseTime}
      </p>
    </section>
  );
}
