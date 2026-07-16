import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { toolByPath } from './data/tools';
import { HomePage } from './pages/HomePage';
import { InfoPage } from './pages/InfoPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToolPlaceholderPage } from './pages/ToolPlaceholderPage';

function ToolRoute({ path }: { path: string }) {
    const tool = toolByPath.get(path);

    return tool ? <ToolPlaceholderPage tool={tool} /> : <NotFoundPage />;
}

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route index element={<HomePage />} />
                <Route path="view" element={<ToolRoute path="/view" />} />
                <Route path="edit" element={<ToolRoute path="/edit" />} />
                <Route path="merge" element={<ToolRoute path="/merge" />} />
                <Route path="split" element={<ToolRoute path="/split" />} />
                <Route path="rotate" element={<ToolRoute path="/rotate" />} />
                <Route path="compress" element={<ToolRoute path="/compress" />} />
                <Route path="sign" element={<ToolRoute path="/sign" />} />
                <Route path="protect" element={<ToolRoute path="/protect" />} />
                <Route path="organize" element={<ToolRoute path="/organize" />} />
                <Route path="optimize" element={<ToolRoute path="/optimize" />} />
                <Route path="privacy" element={<InfoPage title="Privacy">This application shell does not upload or process PDFs. Future browser-only tool modules will document their data handling at the point of use.</InfoPage>} />
                <Route path="terms" element={<InfoPage title="Terms">The service is currently an interface foundation. Tool-specific terms will be added before PDF processing features are released.</InfoPage>} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
