"""
generate_svg_assets.py
Generates 8 clean, consistent, geometric SVG vector reference illustrations for the Asana Library.
"""
import os

svg_templates = {
    'tadasana': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="40" y1="360" x2="260" y2="360" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="150" cy="70" r="20" fill="url(#body)"/>
  <line x1="150" y1="90" x2="150" y2="210" stroke="url(#body)" stroke-width="16" stroke-linecap="round"/>
  <line x1="138" y1="100" x2="120" y2="200" stroke="url(#body)" stroke-width="8" stroke-linecap="round"/>
  <line x1="162" y1="100" x2="180" y2="200" stroke="url(#body)" stroke-width="8" stroke-linecap="round"/>
  <line x1="142" y1="210" x2="142" y2="355" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <line x1="158" y1="210" x2="158" y2="355" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <line x1="150" y1="40" x2="150" y2="370" stroke="#10b981" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Tadasana (Mountain Pose)</text>
</svg>''',

    'vrikshasana': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="40" y1="360" x2="260" y2="360" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <line x1="150" y1="90" x2="130" y2="45" stroke="url(#body)" stroke-width="7" stroke-linecap="round"/>
  <line x1="150" y1="90" x2="170" y2="45" stroke="url(#body)" stroke-width="7" stroke-linecap="round"/>
  <line x1="130" y1="45" x2="150" y2="25" stroke="url(#body)" stroke-width="7" stroke-linecap="round"/>
  <line x1="170" y1="45" x2="150" y2="25" stroke="url(#body)" stroke-width="7" stroke-linecap="round"/>
  <circle cx="150" cy="80" r="18" fill="url(#body)"/>
  <line x1="150" y1="98" x2="150" y2="210" stroke="url(#body)" stroke-width="16" stroke-linecap="round"/>
  <line x1="150" y1="210" x2="150" y2="355" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <line x1="150" y1="210" x2="195" y2="265" stroke="url(#body)" stroke-width="9" stroke-linecap="round"/>
  <line x1="195" y1="265" x2="152" y2="270" stroke="url(#body)" stroke-width="9" stroke-linecap="round"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Vrikshasana (Tree Pose)</text>
</svg>''',

    'trikonasana': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="30" y1="360" x2="270" y2="360" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="80" cy="170" r="16" fill="url(#body)"/>
  <line x1="160" y1="210" x2="95" y2="180" stroke="url(#body)" stroke-width="14" stroke-linecap="round"/>
  <line x1="95" y1="180" x2="95" y2="70" stroke="url(#body)" stroke-width="8" stroke-linecap="round"/>
  <line x1="95" y1="180" x2="80" y2="320" stroke="url(#body)" stroke-width="8" stroke-linecap="round"/>
  <line x1="160" y1="210" x2="80" y2="355" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <line x1="160" y1="210" x2="230" y2="355" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Utthita Trikonasana (Triangle)</text>
</svg>''',

    'virabhadrasanaII': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="30" y1="360" x2="270" y2="360" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="145" cy="110" r="17" fill="url(#body)"/>
  <line x1="145" y1="127" x2="145" y2="225" stroke="url(#body)" stroke-width="15" stroke-linecap="round"/>
  <line x1="145" y1="145" x2="50" y2="145" stroke="url(#body)" stroke-width="8" stroke-linecap="round"/>
  <line x1="145" y1="145" x2="245" y2="145" stroke="url(#body)" stroke-width="8" stroke-linecap="round"/>
  <line x1="145" y1="225" x2="85" y2="235" stroke="url(#body)" stroke-width="11" stroke-linecap="round"/>
  <line x1="85" y1="235" x2="85" y2="355" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <line x1="145" y1="225" x2="235" y2="355" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Virabhadrasana II (Warrior II)</text>
</svg>''',

    'bhujangasana': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="30" y1="330" x2="270" y2="330" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="75" cy="145" r="18" fill="url(#body)"/>
  <path d="M 75 163 Q 95 240 160 310 L 260 325" fill="none" stroke="url(#body)" stroke-width="14" stroke-linecap="round"/>
  <line x1="90" y1="200" x2="85" y2="325" stroke="url(#body)" stroke-width="8" stroke-linecap="round"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Bhujangasana (Cobra Pose)</text>
</svg>''',

    'adhoMukhaSvanasana': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="30" y1="340" x2="270" y2="340" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <line x1="65" y1="335" x2="150" y2="140" stroke="url(#body)" stroke-width="12" stroke-linecap="round"/>
  <circle cx="105" cy="240" r="16" fill="url(#body)"/>
  <line x1="150" y1="140" x2="245" y2="335" stroke="url(#body)" stroke-width="12" stroke-linecap="round"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Adho Mukha Svanasana (Down Dog)</text>
</svg>''',

    'setuBandhasana': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="30" y1="330" x2="270" y2="330" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="60" cy="315" r="17" fill="url(#body)"/>
  <line x1="80" y1="310" x2="160" y2="195" stroke="url(#body)" stroke-width="14" stroke-linecap="round"/>
  <line x1="160" y1="195" x2="235" y2="205" stroke="url(#body)" stroke-width="12" stroke-linecap="round"/>
  <line x1="235" y1="205" x2="235" y2="325" stroke="url(#body)" stroke-width="10" stroke-linecap="round"/>
  <line x1="80" y1="315" x2="180" y2="325" stroke="url(#body)" stroke-width="7" stroke-linecap="round"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Setu Bandhasana (Bridge Pose)</text>
</svg>''',

    'dandasana': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)" rx="12"/>
  <line x1="30" y1="330" x2="270" y2="330" stroke="#334155" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="100" cy="120" r="18" fill="url(#body)"/>
  <line x1="100" y1="138" x2="100" y2="315" stroke="url(#body)" stroke-width="15" stroke-linecap="round"/>
  <line x1="100" y1="160" x2="100" y2="325" stroke="url(#body)" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="315" x2="250" y2="315" stroke="url(#body)" stroke-width="12" stroke-linecap="round"/>
  <line x1="250" y1="315" x2="250" y2="285" stroke="url(#body)" stroke-width="6" stroke-linecap="round"/>
  <text x="150" y="385" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Dandasana (Staff Pose)</text>
</svg>'''
}

for name, svg in svg_templates.items():
    folder = f'frontend/public/images/asanas/{name}'
    os.makedirs(folder, exist_ok=True)
    file_path = f'{folder}/reference.svg'
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(svg.strip())
    print(f'Generated: {file_path}')
