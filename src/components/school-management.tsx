import { Building2, Check, MapPin, Plus } from "lucide-react";
import { createCampus, createSchoolGroup } from "@/app/actions/schools";

type SchoolGroupOption = { id: number; name: string; slug: string };
type CampusRecord = { id: number; name: string; slug: string; timezone: string; groupName: string };

type Notices = {
  campusCreated?: string;
  campusError?: string;
  groupCreated?: string;
  groupError?: string;
};

export function SchoolManagement({
  role,
  groups,
  campuses,
  notices,
}: {
  role: string;
  groups: SchoolGroupOption[];
  campuses: CampusRecord[];
  notices: Notices;
}) {
  const isPlatformAdmin = role === "platform_admin";
  const campusMessage = notices.campusCreated
    ? { text: "Campus added successfully.", success: true }
    : notices.campusError === "duplicate"
      ? { text: "That campus slug is already used in this school group.", success: false }
      : notices.campusError
        ? { text: "Check the campus name, slug, timezone, and school group.", success: false }
        : null;
  const groupMessage = notices.groupCreated
    ? { text: "School group, first campus, and owner account created.", success: true }
    : notices.groupError === "duplicate"
      ? { text: "The group slug, campus slug, or owner email already exists.", success: false }
      : notices.groupError
        ? { text: "Check the required group, campus, and owner details.", success: false }
        : null;

  return (
    <>
      <div className="module-page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot" /> SCHOOL GROUP ADMINISTRATION</div>
          <h1>Schools &amp; campuses</h1>
          <p className="welcome-subtitle">Manage school groups and the campuses that belong to them.</p>
        </div>
        <span className="directory-count">{campuses.length} campuses</span>
      </div>

      {isPlatformAdmin && <section className="school-admin-section">
        <div className="school-admin-heading"><span className="school-admin-icon"><Building2 size={18} /></span><div><h2>Create a school group</h2><p>Set up a new tenant, its first campus, and its group owner login.</p></div></div>
        {groupMessage && <p className={`student-form-notice ${groupMessage.success ? "notice-success" : "notice-error"}`} role="status">{groupMessage.text}</p>}
        <form action={createSchoolGroup} className="school-admin-form">
          <label>School group name<input name="groupName" required minLength={2} maxLength={160} placeholder="Example Education Group" /></label>
          <label>Group slug<input name="groupSlug" required minLength={2} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="example-education" /></label>
          <label>First campus name<input name="campusName" required minLength={2} maxLength={160} placeholder="Main Campus" /></label>
          <label>Campus slug<input name="campusSlug" required minLength={2} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="main-campus" /></label>
          <label>Timezone<input name="timezone" required maxLength={64} defaultValue="Asia/Kolkata" placeholder="Asia/Kolkata" /></label>
          <label>Group owner name<input name="ownerName" required minLength={2} maxLength={160} placeholder="Owner full name" /></label>
          <label>Owner email<input name="ownerEmail" required type="email" maxLength={254} placeholder="owner@school.org" /></label>
          <label>Temporary password<input name="ownerPassword" required type="password" minLength={12} maxLength={128} autoComplete="new-password" placeholder="At least 12 characters" /></label>
          <div className="school-admin-form-actions"><button type="submit" className="primary-button"><Plus size={15} /> Create school group</button></div>
        </form>
      </section>}

      <section className="school-admin-section">
        <div className="school-admin-heading"><span className="school-admin-icon campus-admin-icon"><MapPin size={18} /></span><div><h2>Add a campus</h2><p>{isPlatformAdmin ? "Choose which school group this campus belongs to." : "The campus will be added to your school group."}</p></div></div>
        {campusMessage && <p className={`student-form-notice ${campusMessage.success ? "notice-success" : "notice-error"}`} role="status">{campusMessage.text}</p>}
        {groups.length === 0
          ? <p className="student-form-notice notice-error">No school group is available. Create a school group first.</p>
          : <form action={createCampus} className="school-admin-form campus-form">
            {isPlatformAdmin && <label>School group<select name="groupId" required defaultValue=""><option value="" disabled>Select school group</option>{groups.map((group) => <option value={group.id} key={group.id}>{group.name}</option>)}</select></label>}
            <label>Campus name<input name="name" required minLength={2} maxLength={160} placeholder="North Campus" /></label>
            <label>Campus slug<input name="slug" required minLength={2} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="north-campus" /></label>
            <label>Timezone<input name="timezone" required maxLength={64} defaultValue="Asia/Kolkata" placeholder="Asia/Kolkata" /></label>
            <div className="school-admin-form-actions"><button type="submit" className="primary-button"><Plus size={15} /> Add campus</button></div>
          </form>}
      </section>

      <section className="school-admin-section campus-list-section">
        <div className="school-admin-heading"><span className="school-admin-icon"><Building2 size={18} /></span><div><h2>Campus directory</h2><p>Campuses currently registered in this view.</p></div></div>
        <div className="campus-directory-list">
          {campuses.map((campus) => <article className="campus-directory-row" key={campus.id}>
            <span className="campus-directory-mark"><Building2 size={16} /></span>
            <span className="campus-directory-copy"><strong>{campus.name}</strong><small>{campus.groupName} · {campus.slug}</small></span>
            <span className="campus-timezone">{campus.timezone}</span>
            <span className="campus-active-status"><Check size={13} /> Active</span>
          </article>)}
          {!campuses.length && <p className="module-no-results">No campuses have been created.</p>}
        </div>
      </section>
    </>
  );
}
