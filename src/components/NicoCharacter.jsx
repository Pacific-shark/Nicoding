import React from 'react';

// A single articulated character: every pose keeps the same complete silhouette.
// Vector parts let ears, eyes, paws and tail move without cropping a sprite atlas.
export default function NicoCharacter({pose=0,motion=true,className=''}) {
 return <svg className={`nico-character nico-pose-${pose} ${motion?'nico-alive':''} ${className}`} viewBox="0 0 240 210" aria-hidden="true" focusable="false">
  <ellipse cx="129" cy="193" rx="88" ry="8" fill="#493d31" opacity=".09"/>
  <g className="nico-rig" stroke="#655043" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
   <g className="nico-tail">
    <path d="M97 177C64 193 21 170 24 132L15 124 24 119 15 108 27 108 22 92 35 98 34 82 45 91 49 76 58 89 69 81 70 99C83 112 69 135 80 146L101 152Z" fill="#786456"/>
    <path d="M24 132L15 124 24 119 15 108 27 108 22 92 35 98 34 82 45 91 49 76 58 89 69 81 70 99 60 108 60 97 47 112 47 102 35 124Z" fill="#51483f" stroke="none"/>
    <path d="M34 143Q46 166 69 169M39 134Q51 151 65 153M56 118L62 129" stroke="#a89177" fill="none"/>
   </g>
   <g className="nico-torso">
    <path d="M104 107C89 126 78 151 85 177Q95 194 128 190L185 187Q203 164 187 127L176 107Z" fill="#d9b382"/>
    <path d="M97 134L86 143 93 153 82 160 95 168 91 178 109 182 105 163Z" fill="#b5946b" stroke="none"/>
    <path d="M124 112L113 127 119 129 110 141 119 143 113 157Q113 183 144 189L175 185Q178 158 167 130L172 125 158 113Z" fill="#fffaf0" stroke="none"/>
    <g className="nico-hind-paw"><path d="M180 157Q195 157 193 175L198 181Q202 191 187 193L171 193Q164 191 169 181L168 170Z" fill="#51483f"/><path d="M180 185V191M188 184V191" fill="none" stroke="#8e7964"/></g>
    <g className="nico-back-paw"><path d="M103 157Q111 174 110 181L118 184Q120 193 107 194H94Q83 194 86 186L94 177Z" fill="#fffaf0"/><path d="M94 187V192M102 188V193" fill="none" stroke="#b79d81"/></g>
    <g className="nico-front-paw nico-front-left"><path d="M125 140Q121 159 125 182L119 187Q118 195 130 196L143 195Q150 192 144 187L141 142" fill="#fffaf0"/><path d="M129 189V195M136 189V195" fill="none" stroke="#b79d81"/></g>
    <g className="nico-front-paw nico-front-right"><path d="M155 138Q151 158 154 181L150 187Q149 195 162 196L177 195Q184 191 176 185L172 139" fill="#fffaf0"/><path d="M160 189V195M168 189V195" fill="none" stroke="#b79d81"/></g>
   </g>
   <g className="nico-head">
    <g className="nico-ear-left"><path d="M92 79Q78 58 84 22Q108 29 120 53Z" fill="#d6ae76"/><path d="M91 34L97 66 111 54Z" fill="#e9b5a5" stroke="none"/><path d="M89 31L94 39M90 47L102 52" stroke="#fff7e7"/></g>
    <g className="nico-ear-right"><path d="M164 49Q178 27 201 27Q204 58 187 80Z" fill="#c9a373"/><path d="M178 55L194 36 191 66Z" fill="#e9b5a5" stroke="none"/><path d="M195 34L190 43M194 50L183 55" stroke="#fff7e7"/></g>
    <path d="M89 66L82 71 86 77 74 83 80 90 70 101 83 103 79 112 91 114Q101 133 126 137L138 142 148 135Q178 137 190 116L201 111 195 103 207 97 197 91 204 81 193 77 195 69Q181 45 154 44L147 38 142 46 133 39 131 47Q105 45 89 66Z" fill="#e3ba80"/>
    <path d="M122 49L120 65 112 69 115 81 129 86 141 71 152 78 164 69 162 53 151 55 146 46 138 54Z" fill="#b79367" stroke="none"/>
    <path d="M135 52Q124 68 134 83L124 91Q100 85 87 104L90 113Q107 136 129 136L138 142 148 134Q178 138 193 111L194 104Q181 86 155 91L144 79Z" fill="#fffaf0" stroke="none"/>
    <path d="M88 87L101 80M181 80L195 86M92 75L104 69M178 67L187 72" stroke="#b28d63" strokeWidth="3"/>
    <g className="nico-open-eyes">
     <ellipse cx="112" cy="92" rx="13" ry="15" fill="#a8a27b"/>
     <ellipse cx="170" cy="92" rx="13" ry="15" fill="#a8a27b"/>
     <ellipse cx="113" cy="93" rx="8" ry="11" fill="#343632" stroke="none"/><ellipse cx="169" cy="93" rx="8" ry="11" fill="#343632" stroke="none"/>
     <circle cx="108" cy="86" r="4" fill="#fff" stroke="none"/><circle cx="165" cy="86" r="4" fill="#fff" stroke="none"/>
    </g>
    <g className="nico-closed-eyes" fill="none"><path d="M100 94Q112 103 123 93M159 94Q169 103 182 93" strokeWidth="3"/></g>
    <path d="M135 108Q141 104 147 108L142 113Q140 115 138 112Z" fill="#d39491" stroke="#a77570" strokeWidth="1.5"/>
    <path d="M141 114V119M141 119Q134 125 130 118M141 119Q147 125 152 118" fill="none" strokeWidth="1.4"/>
    <g stroke="#a48f78" strokeWidth="1.2"><path d="M110 112L80 108M109 119L78 122M172 111L202 106M173 119L205 121"/></g>
   </g>
  </g>
  <g className="nico-snooze" fill="#8b8e80" fontFamily="sans-serif" fontSize="15"><text x="194" y="45">z</text><text x="214" y="30" fontSize="11">z</text></g>
 </svg>;
}
