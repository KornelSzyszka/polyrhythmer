import './styles.css';
import './styles/layout.css';
import './styles/spacing.css';
import './theme/tokens.css';
import { App } from './ui/app';
import { setupPwa } from './pwa';
const app = new App(document.querySelector('#app')!);
setupPwa(() => app.engine.clock.running, () => app.engine.stop());
