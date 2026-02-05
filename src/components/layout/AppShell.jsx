import { Header } from './Header';
import { Footer } from './Footer';

const TABS = [
  { id: 'molecules', label: 'Molecules' },
  { id: 'fragments', label: 'Fragments' },
  { id: 'proteins', label: 'Proteins' },
  { id: 'viewer', label: 'Viewer' },
];

export function AppShell({ activeTab, onTabChange, children }) {
  return (
    <div className="app-shell">
      <Header />
      <main id="app-body" className="app-body">
        <nav className="tabs-row" role="tablist" aria-label="Main sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div role="tabpanel" id="panel-molecules" aria-labelledby="tab-molecules" hidden={activeTab !== 'molecules'} className={activeTab === 'molecules' ? 'content-panel active' : 'content-panel'}>
          {activeTab === 'molecules' && children.molecules}
        </div>
        <div role="tabpanel" id="panel-fragments" aria-labelledby="tab-fragments" hidden={activeTab !== 'fragments'} className={activeTab === 'fragments' ? 'content-panel active' : 'content-panel'}>
          {activeTab === 'fragments' && children.fragments}
        </div>
        <div role="tabpanel" id="panel-proteins" aria-labelledby="tab-proteins" hidden={activeTab !== 'proteins'} className={activeTab === 'proteins' ? 'content-panel active' : 'content-panel'}>
          {activeTab === 'proteins' && children.proteins}
        </div>
        <div role="tabpanel" id="panel-viewer" aria-labelledby="tab-viewer" hidden={activeTab !== 'viewer'} className={activeTab === 'viewer' ? 'content-panel active' : 'content-panel'}>
          {activeTab === 'viewer' && children.viewer}
        </div>
      </main>
      <Footer />
    </div>
  );
}
