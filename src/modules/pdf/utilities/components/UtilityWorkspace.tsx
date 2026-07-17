import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { Crop, FileKey, Hash, ImagePlus, RotateCw, Stamp, Tags } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { PdfViewer } from '../../viewer/PdfViewer';
import { usePdfUtilities } from '../hooks/usePdfUtilities';
import type { CropApplicationMode, CropBox, UtilityApplicationMode, UtilityPosition } from '../types/utilities';
import { cropApplicationModeLabel, resolveCropTarget, resolveUtilityTarget, type ResolvedUtilityTarget } from '../utils/utilityTargeting';
import { projectCropMargins } from '../utils/cropCoordinates';

const positions: Array<[string, UtilityPosition]> = [['Top left', 'top-left'], ['Top center', 'top-center'], ['Top right', 'top-right'], ['Center', 'center'], ['Bottom left', 'bottom-left'], ['Bottom center', 'bottom-center'], ['Bottom right', 'bottom-right'], ['Custom', 'custom']];
const numberPositions = positions.filter(([, value]) => value !== 'center' && value !== 'custom') as Array<[string, Exclude<UtilityPosition, 'center' | 'custom'>]>;
const utilityModes = ['all', 'selected', 'custom'] as const;
const cropModes = ['current', 'selected', 'all', 'custom'] as const;

export function UtilityWorkspace() {
    const utilities = usePdfUtilities();
    const { pages, selectedPageIds, activePageId, activePage } = usePdfPageOperations();
    const imageInput = useRef<HTMLInputElement>(null);
    const targetInput = { pages, selectedPageIds, activePageId };
    const watermarkTarget = resolveUtilityTarget({ ...utilities.watermark, ...targetInput });
    const pageNumberTarget = resolveUtilityTarget({ ...utilities.pageNumbers, ...targetInput });
    const headerFooterTarget = resolveUtilityTarget({ ...utilities.headerFooter, ...targetInput });
    const cropTarget = resolveCropTarget({ ...utilities.crop, ...targetInput });
    const applyWatermark = () => { if (watermarkTarget.canApply) utilities.updateWatermark({ enabled: true, pageIds: watermarkTarget.pageIds }); };
    const applyNumbers = () => { if (pageNumberTarget.canApply) utilities.updatePageNumbers({ enabled: true, pageIds: pageNumberTarget.pageIds }); };
    const applyHeaderFooter = () => { if (headerFooterTarget.canApply) utilities.updateHeaderFooter({ enabled: true, pageIds: headerFooterTarget.pageIds }); };
    const crop = utilities.crop.draftByPageId[activePageId ?? ''] ?? utilities.cropsByPageId[activePageId ?? ''] ?? { left: 0, right: 0, top: 0, bottom: 0 };
    const updateCropDraft = (patch: Partial<CropBox>) => { if (activePageId) utilities.setCropDraft(activePageId, { ...crop, ...patch }); };
    const applyCrop = () => {
        if (!activePage || !cropTarget.canApply) return;
        const targets = pages.filter((page) => cropTarget.pageIds.includes(page.id));
        const crops = Object.fromEntries(targets.map((page) => [page.id, projectCropMargins(crop, activePage, page, utilities.crop.distribution)]));
        utilities.applyCrops(crops);
        if (activePageId) utilities.cancelCrop(activePageId);
        utilities.updateCropSettings({ isEditing: false });
    };
    const updateImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const [file] = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (!file || !['image/png', 'image/jpeg'].includes(file.type)) return;
        const source = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
        utilities.updateWatermark({ kind: 'image', imageSource: source });
    };
    return <section className="utility-workspace" aria-label="PDF utility tools">
        <div className="utility-workspace__intro"><div><p className="eyebrow">Free daily-use tools</p><h2>Document utilities</h2><p>Settings are previewed for the open document and exported entirely in this browser.</p></div></div>
        <div className="utility-grid">
            <UtilitySection icon={Stamp} title="Watermark">
                <TargetControls id="watermark-target" target={utilities.watermark} resolution={watermarkTarget} onChange={utilities.updateWatermark} modes={utilityModes} />
                <label>Type<select value={utilities.watermark.kind} onChange={(event) => utilities.updateWatermark({ kind: event.target.value as 'text' | 'image' })}><option value="text">Text</option><option value="image">Image</option></select></label>
                {utilities.watermark.kind === 'text' ? <label>Text<input maxLength={160} value={utilities.watermark.text} onChange={(event) => utilities.updateWatermark({ text: event.target.value })} /></label> : <><input ref={imageInput} className="sr-only" type="file" accept="image/png,image/jpeg" onChange={(event) => void updateImage(event)} /><Button type="button" variant="secondary" size="compact" onClick={() => imageInput.current?.click()}><ImagePlus size={16} aria-hidden="true" />Choose image</Button></>}
                <PositionFields value={utilities.watermark.position} x={utilities.watermark.x} y={utilities.watermark.y} onChange={(patch) => utilities.updateWatermark(patch)} />
                <div className="utility-inline"><label>Size<input type="number" min="8" max="144" value={utilities.watermark.fontSize} onChange={(event) => utilities.updateWatermark({ fontSize: Number(event.target.value) })} /></label><label>Opacity<input type="number" min="0" max="1" step="0.05" value={utilities.watermark.opacity} onChange={(event) => utilities.updateWatermark({ opacity: Number(event.target.value) })} /></label><label>Rotation<input type="number" min="-180" max="180" value={utilities.watermark.rotation} onChange={(event) => utilities.updateWatermark({ rotation: Number(event.target.value) })} /></label><label>Color<input type="color" value={utilities.watermark.color} onChange={(event) => utilities.updateWatermark({ color: event.target.value })} /></label></div>
                <label>Layer<select value="over-pdf-content" disabled><option value="over-pdf-content">Over PDF content</option></select></label><p className="utility-note">This is the single supported composite order. Added annotations render afterward, so the watermark is under added annotations.</p>
                <Actions onApply={applyWatermark} onReset={utilities.resetWatermark} disabled={!watermarkTarget.canApply} />
            </UtilitySection>
            <UtilitySection icon={Hash} title="Page numbers">
                <TargetControls id="page-numbers-target" target={utilities.pageNumbers} resolution={pageNumberTarget} onChange={utilities.updatePageNumbers} modes={utilityModes} />
                <label>Numbering<select value={utilities.pageNumbers.numberingMode} onChange={(event) => utilities.updatePageNumbers({ numberingMode: event.target.value as 'physical' | 'sequential' })}><option value="physical">Physical document pages</option><option value="sequential">Sequential targeted pages</option></select></label>
                <label>Position<select value={utilities.pageNumbers.position} onChange={(event) => utilities.updatePageNumbers({ position: event.target.value as typeof utilities.pageNumbers.position })}>{numberPositions.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <div className="utility-inline"><label>Start<input type="number" min="1" disabled={utilities.pageNumbers.numberingMode === 'physical'} value={utilities.pageNumbers.start} onChange={(event) => utilities.updatePageNumbers({ start: Math.max(1, Number(event.target.value)) })} /></label><label>Size<input type="number" min="6" max="48" value={utilities.pageNumbers.fontSize} onChange={(event) => utilities.updatePageNumbers({ fontSize: Number(event.target.value) })} /></label><label>Margin<input type="number" min="8" max="144" value={utilities.pageNumbers.margin} onChange={(event) => utilities.updatePageNumbers({ margin: Number(event.target.value) })} /></label><label>Color<input type="color" value={utilities.pageNumbers.color} onChange={(event) => utilities.updatePageNumbers({ color: event.target.value })} /></label></div>
                <label>Prefix<input maxLength={80} value={utilities.pageNumbers.prefix} onChange={(event) => utilities.updatePageNumbers({ prefix: event.target.value })} /></label><label>Suffix<input maxLength={80} value={utilities.pageNumbers.suffix} onChange={(event) => utilities.updatePageNumbers({ suffix: event.target.value })} /></label>
                <Actions onApply={applyNumbers} onReset={utilities.resetPageNumbers} disabled={!pageNumberTarget.canApply} />
            </UtilitySection>
            <UtilitySection icon={Tags} title="Header and footer">
                <TargetControls id="header-footer-target" target={utilities.headerFooter} resolution={headerFooterTarget} onChange={utilities.updateHeaderFooter} modes={utilityModes} />
                <p className="utility-note">Use <code>{'{page}'}</code>, <code>{'{totalPages}'}</code>, <code>{'{filename}'}</code>, or <code>{'{date}'}</code>. <code>{'{pages}'}</code> remains supported.</p>
                <div className="utility-triple">{(['headerLeft', 'headerCenter', 'headerRight', 'footerLeft', 'footerCenter', 'footerRight'] as const).map((field) => <label key={field}>{field.replace(/([A-Z])/g, ' $1')}<input maxLength={160} value={utilities.headerFooter[field]} onChange={(event) => utilities.updateHeaderFooter({ [field]: event.target.value })} /></label>)}</div>
                <div className="utility-inline"><label>Size<input type="number" min="6" max="48" value={utilities.headerFooter.fontSize} onChange={(event) => utilities.updateHeaderFooter({ fontSize: Number(event.target.value) })} /></label><label>Margin<input type="number" min="8" max="144" value={utilities.headerFooter.margin} onChange={(event) => utilities.updateHeaderFooter({ margin: Number(event.target.value) })} /></label><label>Color<input type="color" value={utilities.headerFooter.color} onChange={(event) => utilities.updateHeaderFooter({ color: event.target.value })} /></label></div>
                <Actions onApply={applyHeaderFooter} onReset={utilities.resetHeaderFooter} disabled={!headerFooterTarget.canApply} />
            </UtilitySection>
            <UtilitySection icon={Crop} title="Crop pages"><p className="utility-note">Crop margins are stored in PDF points. Edit the fields or use the page rectangle.</p><TargetControls id="crop-target" target={utilities.crop} resolution={cropTarget} onChange={utilities.updateCropSettings} modes={cropModes} /><label>For mixed page sizes<select value={utilities.crop.distribution} onChange={(event) => utilities.updateCropSettings({ distribution: event.target.value as 'absolute' | 'proportional' })}><option value="absolute">Same absolute margins</option><option value="proportional">Same proportional crop</option></select></label><div className="utility-inline">{(['left', 'right', 'top', 'bottom'] as const).map((side) => <label key={side}>{side}<input type="number" min="0" max="300" value={crop[side]} onChange={(event) => updateCropDraft({ [side]: Math.max(0, Number(event.target.value)) })} /></label>)}</div><div className="utility-actions"><Button type="button" size="compact" variant="secondary" onClick={() => utilities.updateCropSettings({ isEditing: !utilities.crop.isEditing })}>{utilities.crop.isEditing ? 'Hide rectangle' : 'Edit rectangle'}</Button><Button type="button" size="compact" onClick={applyCrop} disabled={!cropTarget.canApply}>Apply</Button><Button type="button" size="compact" variant="secondary" onClick={() => { if (activePageId) utilities.cancelCrop(activePageId); utilities.updateCropSettings({ isEditing: false }); }}>Cancel</Button><Button type="button" size="compact" variant="secondary" onClick={() => { utilities.resetCrop(cropTarget.pageIds); utilities.updateCropSettings({ isEditing: false }); }}>Reset</Button></div></UtilitySection>
            <UtilitySection icon={RotateCw} title="Document metadata"><div className="utility-triple">{(['title', 'author', 'subject', 'keywords', 'creator', 'producer'] as const).map((field) => <label key={field}>{field}<input maxLength={255} value={utilities.metadata[field]} onChange={(event) => utilities.updateMetadata({ [field]: event.target.value })} /></label>)}</div><p className="utility-note">Metadata is written on export. Empty fields clear the corresponding export value.</p></UtilitySection>
            <UtilitySection icon={FileKey} title="Protection"><p className="utility-note">Password protection and unlocking are coming later. The browser libraries in this release do not provide a reliable encryption or password-removal workflow, so no password feature is simulated.</p><Button type="button" variant="secondary" size="compact" disabled>Coming later</Button></UtilitySection>
        </div>
        <PdfViewer />
    </section>;
}

function UtilitySection({ icon: Icon, title, children }: { icon: typeof Stamp; title: string; children: ReactNode }) { return <section className="utility-section"><div className="utility-section__title"><Icon size={18} aria-hidden="true" /><h3>{title}</h3></div>{children}</section>; }

function Actions({ onApply, onReset, disabled = false }: { onApply: () => void; onReset: () => void; disabled?: boolean }) { return <div className="utility-actions"><Button type="button" size="compact" onClick={onApply} disabled={disabled}>Apply</Button><Button type="button" size="compact" variant="secondary" onClick={onReset}>Reset</Button></div>; }

function PositionFields({ value, x, y, onChange }: { value: UtilityPosition; x: number; y: number; onChange: (patch: { position?: UtilityPosition; x?: number; y?: number }) => void }) { return <><label>Position<select value={value} onChange={(event) => onChange({ position: event.target.value as UtilityPosition })}>{positions.map(([label, position]) => <option key={position} value={position}>{label}</option>)}</select></label>{value === 'custom' && <div className="utility-inline"><label>X %<input type="number" min="0" max="100" value={x} onChange={(event) => onChange({ x: Number(event.target.value) })} /></label><label>Y %<input type="number" min="0" max="100" value={y} onChange={(event) => onChange({ y: Number(event.target.value) })} /></label></div>}</>; }

function TargetControls<TMode extends UtilityApplicationMode | CropApplicationMode>({ id, target, resolution, onChange, modes }: { id: string; target: { applicationMode: TMode; customRange: string }; resolution: ResolvedUtilityTarget; onChange: (patch: { applicationMode?: TMode; customRange?: string }) => void; modes: ReadonlyArray<TMode> }) {
    const descriptionId = `range-${id}`;
    return <fieldset className="utility-target"><legend>Apply to</legend><select value={target.applicationMode} onChange={(event) => onChange({ applicationMode: event.target.value as TMode })}>{modes.map((mode) => <option key={mode} value={mode}>{cropApplicationModeLabel(mode)}</option>)}</select>{target.applicationMode === 'custom' && <label>Page range<input aria-describedby={descriptionId} inputMode="text" placeholder="1-3, 5, 8-10" value={target.customRange} onChange={(event) => onChange({ customRange: event.target.value })} /></label>}<div id={descriptionId} className="utility-target__summary">{resolution.normalizedRange && <>Normalized: <code>{resolution.normalizedRange}</code>. </>}Affected pages: {resolution.affectedPageCount}.</div>{resolution.errors.length > 0 && <ul className="utility-target__errors" role="alert">{resolution.errors.map((error) => <li key={error}>{error}</li>)}</ul>}</fieldset>;
}
