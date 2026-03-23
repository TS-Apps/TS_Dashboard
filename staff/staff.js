(function () {
"use strict";
const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;
const SUPABASE_URL = 'https://dussngodqlbmfduwfvkc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4iaGyP4WsrZ_SgdlC0xAhA_y2HfCZJ7';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ── Utilities ─────────────────────────────────────────────────────────────────

const splitCSVLine = str => {
  const arr = [];
  let quote = false;
  let col = '';
  for (const c of str) {
    if (c === '"') {
      quote = !quote;
      continue;
    }
    if (c === ',' && !quote) {
      arr.push(col);
      col = '';
      continue;
    }
    col += c;
  }
  arr.push(col);
  return arr;
};
const sanitizeText = text => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<[^>]+>/g, '').trim();
};
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const parseDate = dateStr => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split(/[\/\-\s]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    if (isNaN(month) || month < 0 || month > 11) {
      month = MONTHS.findIndex(m => parts[1].toLowerCase().startsWith(m));
    }
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    if (!isNaN(day) && month >= 0 && !isNaN(year)) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};
const formatDate = date => {
  if (!date) return '—';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
};
const formatDateISO = d => {
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const isCadet = person => {
  if (!person) return false;
  if (person.pNumber) {
    const p = person.pNumber.toUpperCase();
    if (p.startsWith('CV')) return false;
    if (p.startsWith('L') && p.endsWith('L') && p.length > 2) return false;
  }
  if (person.rank) {
    const r = person.rank.toLowerCase();
    if (r.includes('unit assistant') || r.includes(' ua') || r === 'ua' || r.includes('staff') || r.includes('officer') || r.includes('instructor') || r.includes('civilian')) return false;
    if (r.includes('cadet') || r.includes('recruit') || r.includes('marine')) return true;
  }
  return true;
};
const normalizeUnit = u => {
  if (!u) return u;
  if (/\(rmcd\)/i.test(u)) return 'RMCD';
  return u;
};
const getQualStatus = validTill => {
  if (!validTill) return 'no_expiry';
  const days = (new Date(validTill) - new Date()) / 86400000;
  if (days < 0) return 'expired';
  if (days < 90) return 'expiring';
  return 'current';
};
const checkIsAdmin = async () => {
  try {
    const {
      data: {
        user
      },
      error
    } = await supabase.auth.getUser();
    if (error || !user) return false;
    const {
      data
    } = await supabase.from('user_profiles').select('is_admin').eq('id', user.id).single();
    return data?.is_admin || false;
  } catch {
    return false;
  }
};

// ── Icon ──────────────────────────────────────────────────────────────────────

const Icon = React.memo(({
  name,
  className = 'w-4 h-4'
}) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ref.current && window.lucide && !ready) {
      const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      ref.current.setAttribute('data-lucide', slug);
      requestAnimationFrame(() => {
        try {
          window.lucide.createIcons();
          setReady(true);
        } catch (e) {}
      });
    }
  }, [name, ready]);
  return /*#__PURE__*/React.createElement("i", {
    ref: ref,
    className: className
  });
});

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({
  status
}) => {
  const map = {
    current: {
      cls: 'bg-green-100 text-green-800',
      label: 'Current'
    },
    expiring: {
      cls: 'bg-amber-100 text-amber-800',
      label: 'Expiring'
    },
    expired: {
      cls: 'bg-red-100 text-red-800',
      label: 'Expired'
    },
    no_expiry: {
      cls: 'bg-slate-100 text-slate-600',
      label: 'No expiry'
    }
  };
  const {
    cls,
    label
  } = map[status] || map.no_expiry;
  return /*#__PURE__*/React.createElement("span", {
    className: `text-xs font-medium px-2 py-0.5 rounded-full ${cls}`
  }, label);
};

// ── Login form ────────────────────────────────────────────────────────────────

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex items-center justify-center bg-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold text-blue-900 mb-1"
  }, "Staff Qualifications"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500"
  }, "Market Harborough Sea Cadets")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 mb-1"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    required: true,
    className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-slate-700 mb-1"
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    required: true,
    className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  })), error && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-red-600 bg-red-50 p-3 rounded"
  }, error), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
  }, loading ? 'Signing in...' : 'Sign In')), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 text-center text-sm"
  }, /*#__PURE__*/React.createElement("a", {
    href: "../",
    className: "text-blue-500 hover:text-blue-700"
  }, "\u2190 Back to main dashboard"))));
};

// ── Auth wrapper ──────────────────────────────────────────────────────────────

const AuthWrapper = ({
  children
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (loading) return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex items-center justify-center bg-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-600"
  }, "Loading...")));
  if (!user) return /*#__PURE__*/React.createElement(LoginForm, null);
  return children(user);
};

// ── By-Person view ────────────────────────────────────────────────────────────

const ByPersonView = ({
  staff,
  staffQuals,
  syllabusFilter
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const getPersonQuals = pNumber => {
    let qs = staffQuals.filter(q => q.p_number === pNumber);
    if (syllabusFilter) qs = qs.filter(q => q.syllabus && q.syllabus.includes(syllabusFilter));
    return qs.sort((a, b) => {
      const order = {
        expired: 0,
        expiring: 1,
        current: 2,
        no_expiry: 3
      };
      return (order[getQualStatus(a.valid_till)] ?? 4) - (order[getQualStatus(b.valid_till)] ?? 4);
    });
  };
  if (staff.length === 0) return /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg shadow p-12 text-center text-slate-400"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Users",
    className: "w-10 h-10 mx-auto mb-3"
  }), /*#__PURE__*/React.createElement("p", null, "No staff members found."));
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg shadow overflow-hidden"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-sm"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-50 border-b border-slate-200"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "text-left px-4 py-3 font-semibold text-slate-700"
  }, "Name"), /*#__PURE__*/React.createElement("th", {
    className: "text-left px-4 py-3 font-semibold text-slate-700"
  }, "Rank"), /*#__PURE__*/React.createElement("th", {
    className: "text-left px-4 py-3 font-semibold text-slate-700"
  }, "Unit"), /*#__PURE__*/React.createElement("th", {
    className: "text-center px-4 py-3 font-semibold text-slate-700"
  }, "Quals"), /*#__PURE__*/React.createElement("th", {
    className: "text-center px-4 py-3 font-semibold text-red-600"
  }, "Expired"), /*#__PURE__*/React.createElement("th", {
    className: "text-center px-4 py-3 font-semibold text-amber-600"
  }, "Expiring"), /*#__PURE__*/React.createElement("th", {
    className: "w-8 px-4 py-3"
  }))), /*#__PURE__*/React.createElement("tbody", null, staff.map(person => {
    const qs = getPersonQuals(person.pNumber);
    const expired = qs.filter(q => getQualStatus(q.valid_till) === 'expired').length;
    const expiring = qs.filter(q => getQualStatus(q.valid_till) === 'expiring').length;
    const open = expandedRow === person.pNumber;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: person.pNumber
    }, /*#__PURE__*/React.createElement("tr", {
      className: `border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${open ? 'bg-blue-50' : ''}`,
      onClick: () => setExpandedRow(open ? null : person.pNumber)
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-3 font-medium text-slate-800"
    }, person.name), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-3 text-slate-500 text-xs"
    }, person.rank), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-3 text-slate-500 text-xs"
    }, person.unit), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-3 text-center font-semibold text-slate-700"
    }, qs.length), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-3 text-center"
    }, expired > 0 ? /*#__PURE__*/React.createElement("span", {
      className: "text-red-600 font-bold"
    }, expired) : /*#__PURE__*/React.createElement("span", {
      className: "text-slate-300"
    }, "\u2014")), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-3 text-center"
    }, expiring > 0 ? /*#__PURE__*/React.createElement("span", {
      className: "text-amber-600 font-bold"
    }, expiring) : /*#__PURE__*/React.createElement("span", {
      className: "text-slate-300"
    }, "\u2014")), /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-3 text-slate-400"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: open ? 'ChevronUp' : 'ChevronDown',
      className: "w-4 h-4"
    }))), open && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: 7,
      className: "bg-slate-50 px-6 py-4 border-b border-slate-200"
    }, qs.length === 0 ? /*#__PURE__*/React.createElement("p", {
      className: "text-slate-400 italic text-sm"
    }, "No qualification records found.") : /*#__PURE__*/React.createElement("table", {
      className: "w-full text-xs"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      className: "text-slate-500 border-b border-slate-200"
    }, /*#__PURE__*/React.createElement("th", {
      className: "text-left py-1.5 pr-4 font-medium"
    }, "Module"), /*#__PURE__*/React.createElement("th", {
      className: "text-left py-1.5 pr-4 font-medium"
    }, "Syllabus"), /*#__PURE__*/React.createElement("th", {
      className: "text-left py-1.5 pr-4 font-medium"
    }, "Achieved"), /*#__PURE__*/React.createElement("th", {
      className: "text-left py-1.5 pr-4 font-medium"
    }, "Valid Till"), /*#__PURE__*/React.createElement("th", {
      className: "text-left py-1.5 pr-4 font-medium"
    }, "Revalidated"), /*#__PURE__*/React.createElement("th", {
      className: "text-left py-1.5 pr-4 font-medium"
    }, "Status"), /*#__PURE__*/React.createElement("th", {
      className: "text-left py-1.5 font-medium"
    }, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, qs.map((q, i) => /*#__PURE__*/React.createElement("tr", {
      key: i,
      className: "border-b border-slate-100 hover:bg-white"
    }, /*#__PURE__*/React.createElement("td", {
      className: "py-1.5 pr-4 font-medium text-slate-800"
    }, q.module), /*#__PURE__*/React.createElement("td", {
      className: "py-1.5 pr-4 text-slate-500 max-w-[160px]"
    }, /*#__PURE__*/React.createElement("span", {
      title: q.syllabus,
      className: "block truncate"
    }, q.syllabus || '—')), /*#__PURE__*/React.createElement("td", {
      className: "py-1.5 pr-4 text-slate-600"
    }, formatDate(q.date_achieved)), /*#__PURE__*/React.createElement("td", {
      className: "py-1.5 pr-4 text-slate-600"
    }, formatDate(q.valid_till)), /*#__PURE__*/React.createElement("td", {
      className: "py-1.5 pr-4 text-slate-500"
    }, q.revalidated ? 'Yes' : 'No'), /*#__PURE__*/React.createElement("td", {
      className: "py-1.5 pr-4"
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      status: getQualStatus(q.valid_till)
    })), /*#__PURE__*/React.createElement("td", {
      className: "py-1.5 text-slate-500 max-w-[200px]"
    }, /*#__PURE__*/React.createElement("span", {
      title: q.notes,
      className: "block truncate"
    }, q.notes || '—')))))))));
  }))));
};

// ── Matrix view ───────────────────────────────────────────────────────────────

const MatrixView = ({
  staff,
  staffQuals,
  syllabusFilter
}) => {
  const filtered = syllabusFilter ? staffQuals.filter(q => q.syllabus && q.syllabus.includes(syllabusFilter)) : staffQuals;
  const modules = useMemo(() => [...new Set(filtered.map(q => q.module))].sort(), [filtered]);
  const lookup = useMemo(() => {
    const map = {};
    filtered.forEach(q => {
      if (!map[q.p_number]) map[q.p_number] = {};
      const existing = map[q.p_number][q.module];
      if (!existing) {
        map[q.p_number][q.module] = q;
      } else {
        // Keep worst status
        const order = {
          expired: 0,
          expiring: 1,
          current: 2,
          no_expiry: 3
        };
        if ((order[getQualStatus(q.valid_till)] ?? 4) < (order[getQualStatus(existing.valid_till)] ?? 4)) {
          map[q.p_number][q.module] = q;
        }
      }
    });
    return map;
  }, [filtered]);
  if (modules.length === 0) return /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg shadow p-12 text-center text-slate-400"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Grid",
    className: "w-10 h-10 mx-auto mb-3"
  }), /*#__PURE__*/React.createElement("p", null, "No qualification data to display."), staffQuals.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2"
  }, "Upload the Adult Qualifications Report CSV first."));
  const cell = status => {
    if (!status) return /*#__PURE__*/React.createElement("span", {
      className: "text-slate-200"
    }, "\u2014");
    if (status === 'current') return /*#__PURE__*/React.createElement("span", {
      className: "text-green-600 font-bold text-base"
    }, "\u2713");
    if (status === 'expiring') return /*#__PURE__*/React.createElement("span", {
      className: "text-amber-500 font-bold text-base"
    }, "\u26A0");
    if (status === 'expired') return /*#__PURE__*/React.createElement("span", {
      className: "text-red-600 font-bold text-base"
    }, "\u2717");
    if (status === 'no_expiry') return /*#__PURE__*/React.createElement("span", {
      className: "text-slate-500 text-base"
    }, "\u2713");
    return /*#__PURE__*/React.createElement("span", {
      className: "text-slate-200"
    }, "\u2014");
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto rounded-lg shadow"
  }, /*#__PURE__*/React.createElement("table", {
    className: "text-xs border-collapse bg-white",
    style: {
      minWidth: '100%'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "bg-slate-50"
  }, /*#__PURE__*/React.createElement("th", {
    className: "text-left px-4 py-3 font-semibold text-slate-700 border-b border-r border-slate-200 sticky left-0 bg-slate-50 z-10",
    style: {
      minWidth: 180
    }
  }, "Staff Member"), modules.map(m => /*#__PURE__*/React.createElement("th", {
    key: m,
    className: "border-b border-slate-200 text-center px-1",
    style: {
      minWidth: 44,
      verticalAlign: 'bottom',
      height: 130
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-flex-end justify-center",
    style: {
      height: 120
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "matrix-th-text text-slate-600"
  }, m)))))), /*#__PURE__*/React.createElement("tbody", null, staff.map((person, ri) => {
    const rowBg = ri % 2 === 0 ? '#ffffff' : '#f8fafc';
    return /*#__PURE__*/React.createElement("tr", {
      key: person.pNumber,
      style: {
        backgroundColor: rowBg
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-4 py-2 border-b border-r border-slate-100 sticky left-0 z-10",
      style: {
        minWidth: 180,
        backgroundColor: rowBg
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-medium text-slate-800 truncate"
    }, person.name), /*#__PURE__*/React.createElement("div", {
      className: "text-slate-400",
      style: {
        fontSize: 10
      }
    }, person.rank)), modules.map(m => {
      const q = lookup[person.pNumber]?.[m];
      const st = q ? getQualStatus(q.valid_till) : null;
      const bg = st === 'expired' ? '#fef2f2' : st === 'expiring' ? '#fffbeb' : st === 'current' || st === 'no_expiry' ? '#f0fdf4' : '';
      const title = q ? `${m}\nAchieved: ${formatDate(q.date_achieved)}\nValid till: ${formatDate(q.valid_till)}${q.notes ? '\n' + q.notes : ''}` : `${m}: not held`;
      return /*#__PURE__*/React.createElement("td", {
        key: m,
        className: "border-b border-slate-100 text-center py-2 px-1",
        style: {
          backgroundColor: bg
        },
        title: title
      }, cell(st));
    }));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-4 mt-3 text-xs text-slate-500 px-1"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "text-green-600 font-bold"
  }, "\u2713"), " Current"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-500"
  }, "\u2713"), " No expiry date"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "text-amber-500 font-bold"
  }, "\u26A0"), " Expiring (<90 days)"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "text-red-600 font-bold"
  }, "\u2717"), " Expired"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-300"
  }, "\u2014"), " Not held")));
};

// ── Upload section (admin only) ───────────────────────────────────────────────

const UploadSection = ({
  onUploaded
}) => {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);
  const handleFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMsg('Reading file...');
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) throw new Error('File appears empty.');
      const headers = splitCSVLine(lines[0]).map(h => sanitizeText(h).trim().toLowerCase());
      const col = name => headers.findIndex(h => h.includes(name));
      const syllabusCol = col('syllabus');
      const pNumberCol = headers.findIndex(h => h.includes('pnumber') || h === 'pnumber' || h === 'p number' || h === 'number');
      const moduleCol = col('module');
      const resultCol = col('result');
      const dateAchCol = col('date achieved');
      const revalCol = col('revalidated');
      const notesCol = col('notes');
      const validTillCol = col('valid till');
      if (pNumberCol === -1 || moduleCol === -1) {
        throw new Error('Could not find required columns "PNumber" and "Module". Check the CSV format matches the Adult Qualifications Report.');
      }
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = splitCSVLine(lines[i]);
        const pNum = sanitizeText(cols[pNumberCol] || '').trim();
        const module = sanitizeText(cols[moduleCol] || '').trim();
        if (!pNum || !module) continue;
        rows.push({
          p_number: pNum,
          syllabus: syllabusCol >= 0 ? sanitizeText(cols[syllabusCol] || '').trim() || null : null,
          module,
          result: resultCol >= 0 ? sanitizeText(cols[resultCol] || '').trim() || null : null,
          date_achieved: dateAchCol >= 0 ? formatDateISO(parseDate((cols[dateAchCol] || '').trim())) : null,
          revalidated: revalCol >= 0 ? (cols[revalCol] || '').trim().toLowerCase() === 'yes' : false,
          notes: notesCol >= 0 ? sanitizeText(cols[notesCol] || '').trim() || null : null,
          valid_till: validTillCol >= 0 ? formatDateISO(parseDate((cols[validTillCol] || '').trim())) : null
        });
      }
      setMsg(`Parsed ${rows.length} records. Clearing existing data...`);
      const {
        error: delErr
      } = await supabase.from('staff_qualifications').delete().not('p_number', 'is', null);
      if (delErr) throw delErr;
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < rows.length; i += BATCH) {
        const {
          error: insErr
        } = await supabase.from('staff_qualifications').insert(rows.slice(i, i + BATCH));
        if (insErr) throw insErr;
        inserted += Math.min(BATCH, rows.length - i);
        setMsg(`Uploading... ${inserted}/${rows.length}`);
      }
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (user) await supabase.from('upload_history').insert({
          user_id: user.id,
          user_email: user.email,
          upload_type: 'staff_qualifications'
        });
      } catch (_) {}
      setMsg(`✓ Uploaded ${rows.length} records successfully.`);
      if (fileRef.current) fileRef.current.value = '';
      if (onUploaded) onUploaded();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-dashed border-slate-300 rounded-lg p-5 mt-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold text-slate-700 mb-1 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Upload",
    className: "w-4 h-4"
  }), " Upload Staff Qualifications CSV"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 mb-3"
  }, "Upload the \"Adult Qualifications Report.csv\" from Westminster. Expected columns: ", /*#__PURE__*/React.createElement("strong", null, "Syllabus, PNumber, Rank, Name, Module, Result, Date Achieved, Revalidated, Notes/Exemption Reason, Valid Till"), ". This will replace all existing staff qualification records."), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: ".csv",
    onChange: handleFile,
    disabled: uploading,
    className: "block text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
  }), msg && /*#__PURE__*/React.createElement("p", {
    className: `mt-2 text-sm ${msg.startsWith('✓') ? 'text-green-700' : msg.startsWith('Error') ? 'text-red-600' : 'text-slate-600'}`
  }, msg));
};

// ── Main app ──────────────────────────────────────────────────────────────────

const StaffApp = ({
  user
}) => {
  const [view, setView] = useState('by_person');
  const [personnel, setPersonnel] = useState([]);
  const [staffQuals, setStaffQuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [syllabusFilter, setSyllabusFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    checkIsAdmin().then(setIsAdmin);
  }, []);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const {
          data: pRows,
          error: pErr
        } = await supabase.from('personnel').select('*');
        if (pErr) throw pErr;
        let sqRows = [];
        const pageSize = 1000;
        let page = 0,
          hasMore = true;
        while (hasMore) {
          const {
            data: batch,
            error: sqErr
          } = await supabase.from('staff_qualifications').select('*').range(page * pageSize, (page + 1) * pageSize - 1);
          if (sqErr) throw sqErr;
          if (batch && batch.length > 0) {
            sqRows = [...sqRows, ...batch];
            page++;
            hasMore = batch.length === pageSize;
          } else hasMore = false;
        }
        setPersonnel((pRows || []).map(r => ({
          pNumber: r.p_number,
          name: r.name,
          rank: r.rank,
          unit: normalizeUnit(r.unit),
          section: r.section,
          dob: r.dob
        })));
        setStaffQuals(sqRows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);
  const staff = useMemo(() => personnel.filter(p => !isCadet(p)), [personnel]);
  const filteredStaff = useMemo(() => staff.filter(p => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.rank?.toLowerCase().includes(search.toLowerCase())) return false;
    if (unitFilter && p.unit !== unitFilter) return false;
    return true;
  }), [staff, search, unitFilter]);
  const allSyllabi = useMemo(() => {
    const s = new Set();
    staffQuals.forEach(q => {
      if (q.syllabus) q.syllabus.split(',').forEach(v => {
        const t = v.trim();
        if (t) s.add(t);
      });
    });
    return [...s].sort();
  }, [staffQuals]);
  const allUnits = useMemo(() => [...new Set(staff.map(p => p.unit).filter(Boolean))].sort(), [staff]);
  const summary = useMemo(() => ({
    total: staffQuals.length,
    expired: staffQuals.filter(q => getQualStatus(q.valid_till) === 'expired').length,
    expiring: staffQuals.filter(q => getQualStatus(q.valid_till) === 'expiring').length
  }), [staffQuals]);
  if (loading) return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex items-center justify-center bg-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-600"
  }, "Loading staff data...")));
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-slate-100"
  }, /*#__PURE__*/React.createElement("header", {
    className: "bg-blue-900 text-white shadow-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-6 py-3 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("a", {
    href: "../",
    className: "text-blue-300 hover:text-white text-sm flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronLeft",
    className: "w-4 h-4"
  }), " Dashboard"), /*#__PURE__*/React.createElement("span", {
    className: "text-blue-600"
  }, "|"), /*#__PURE__*/React.createElement("h1", {
    className: "text-lg font-bold"
  }, "Staff Qualifications")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex bg-blue-800 rounded-lg p-1 gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setView('by_person'),
    className: `px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'by_person' ? 'bg-white text-blue-900' : 'text-blue-200 hover:text-white'}`
  }, "By Person"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setView('matrix'),
    className: `px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'matrix' ? 'bg-white text-blue-900' : 'text-blue-200 hover:text-white'}`
  }, "By Qualification")), /*#__PURE__*/React.createElement("button", {
    onClick: () => supabase.auth.signOut(),
    title: "Sign out",
    className: "text-blue-300 hover:text-white text-xs flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "LogOut",
    className: "w-4 h-4"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-b border-slate-200 px-6 py-2 flex flex-wrap gap-6 text-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-600"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-blue-700"
  }, staff.length), " staff members"), /*#__PURE__*/React.createElement("span", {
    className: "text-slate-600"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-700"
  }, summary.total), " qual records"), summary.expired > 0 && /*#__PURE__*/React.createElement("span", {
    className: "text-red-600 font-medium"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, summary.expired), " expired"), summary.expiring > 0 && /*#__PURE__*/React.createElement("span", {
    className: "text-amber-600 font-medium"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, summary.expiring), " expiring <90 days")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap gap-3 items-center"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search by name or rank...",
    value: search,
    onChange: e => setSearch(e.target.value),
    className: "px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
  }), /*#__PURE__*/React.createElement("select", {
    value: syllabusFilter,
    onChange: e => setSyllabusFilter(e.target.value),
    className: "px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All syllabi"), allSyllabi.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s))), /*#__PURE__*/React.createElement("select", {
    value: unitFilter,
    onChange: e => setUnitFilter(e.target.value),
    className: "px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All units"), allUnits.map(u => /*#__PURE__*/React.createElement("option", {
    key: u,
    value: u
  }, u))), (search || syllabusFilter || unitFilter) && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSearch('');
      setSyllabusFilter('');
      setUnitFilter('');
    },
    className: "px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg"
  }, "Clear filters"), /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-slate-400 ml-auto"
  }, filteredStaff.length, " of ", staff.length, " shown")), /*#__PURE__*/React.createElement("main", {
    className: "p-6"
  }, error && /*#__PURE__*/React.createElement("div", {
    className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
  }, error), view === 'by_person' ? /*#__PURE__*/React.createElement(ByPersonView, {
    staff: filteredStaff,
    staffQuals: staffQuals,
    syllabusFilter: syllabusFilter
  }) : /*#__PURE__*/React.createElement(MatrixView, {
    staff: filteredStaff,
    staffQuals: staffQuals,
    syllabusFilter: syllabusFilter
  }), isAdmin && /*#__PURE__*/React.createElement(UploadSection, {
    onUploaded: () => setRefreshKey(k => k + 1)
  })));
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────
ReactDOM.render(/*#__PURE__*/React.createElement(AuthWrapper, null, user => /*#__PURE__*/React.createElement(StaffApp, {
  user: user
})), document.getElementById('root'));
})();
