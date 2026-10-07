import React, { useEffect, useRef, useState } from "react";
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography,
} from "@mui/material";
import { chatTrackingService } from "../services/chatTrackingService";

const BATCH_PAGE_SIZE = 10;
const ROW_PAGE_SIZE = 20;
const PROGRESS_OPTIONS = ["Sudah Selesai", "Belum Selesai", "Sedang Diproses"];
const STATUS_LABELS = { valid: "Valid", review: "Perlu tinjau", invalid: "Tidak valid", excluded: "Dikecualikan" };
const REASON_LABELS = { reviewed_correction: "Sudah ditinjau admin", blank_row: "Baris kosong", header: "Header", number_only: "Hanya nomor" };

const formatTime = (value) => value
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "-";

const ChatTrackingImportReviewDialog = ({ open, onClose, initialBatchId }) => {
    const initialSelectionDone = useRef(false);
    const [batches, setBatches] = useState([]);
    const [batchTotal, setBatchTotal] = useState(0);
    const [batchPage, setBatchPage] = useState(0);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [rows, setRows] = useState([]);
    const [rowTotal, setRowTotal] = useState(0);
    const [rowPage, setRowPage] = useState(0);
    const [rowStatus, setRowStatus] = useState("all");
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingRows, setLoadingRows] = useState(false);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [reconciliation, setReconciliation] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [correction, setCorrection] = useState({});
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return undefined;
        let cancelled = false;
        setLoadingBatches(true);
        setError("");
        chatTrackingService.listImportBatches({ page: batchPage + 1, pageSize: BATCH_PAGE_SIZE })
            .then(async (result) => {
                if (cancelled) return;
                setBatches(result.data);
                setBatchTotal(result.pagination.total);
                setSelectedBatch((current) => current
                    ? (result.data.find((item) => item.id === current.id) || current)
                    : current);
                if (initialBatchId && !initialSelectionDone.current) {
                    initialSelectionDone.current = true;
                    const initial = result.data.find((item) => item.id === initialBatchId);
                    if (initial) {
                        setSelectedBatch(initial);
                    } else {
                        const detail = await chatTrackingService.listImportRows(initialBatchId, { page: 1, pageSize: 1 });
                        if (!cancelled) setSelectedBatch(detail.batch);
                    }
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || "Gagal memuat batch staging.");
            })
            .finally(() => { if (!cancelled) setLoadingBatches(false); });
        return () => { cancelled = true; };
    }, [open, batchPage, initialBatchId, refreshKey]);

    useEffect(() => {
        if (!open || !selectedBatch) return undefined;
        let cancelled = false;
        setLoadingRows(true);
        setError("");
        chatTrackingService.listImportRows(selectedBatch.id, {
            page: rowPage + 1,
            pageSize: ROW_PAGE_SIZE,
            ...(rowStatus !== "all" ? { status: rowStatus } : {}),
        })
            .then((result) => {
                if (cancelled) return;
                setRows(result.data);
                setRowTotal(result.pagination.total);
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || "Gagal memuat baris staging.");
            })
            .finally(() => { if (!cancelled) setLoadingRows(false); });
        return () => { cancelled = true; };
    }, [open, selectedBatch, rowPage, rowStatus, refreshKey]);

    useEffect(() => {
        if (!open || !selectedBatch) return undefined;
        let cancelled = false;
        setReconciliation(null);
        chatTrackingService.getImportReconciliation(selectedBatch.id)
            .then((data) => { if (!cancelled) setReconciliation(data); })
            .catch((err) => { if (!cancelled) setError(err.response?.data?.message || "Gagal memuat rekonsiliasi."); });
        return () => { cancelled = true; };
    }, [open, selectedBatch, refreshKey]);

    const beginCorrection = (row) => {
        setEditingRow(row);
        setCorrection({
            nama_pic: row.normalized_data?.nama_pic || "",
            tanggal: row.normalized_data?.tanggal || "",
            deskripsi: row.normalized_data?.deskripsi || "",
            progress: row.normalized_data?.progress || "",
            keterangan: row.normalized_data?.keterangan || "",
        });
        setReason("");
        setError("");
    };

    const saveCorrection = async () => {
        if (!editingRow || reason.trim().length < 10) return;
        setSaving(true);
        setError("");
        try {
            await chatTrackingService.correctImportRow(selectedBatch.id, editingRow.id, {
                reviewVersion: editingRow.review_version,
                changes: correction,
                reason,
            });
            setEditingRow(null);
            setRefreshKey((value) => value + 1);
        } catch (err) {
            setError(err.response?.data?.message || "Koreksi gagal disimpan.");
        } finally {
            setSaving(false);
        }
    };

    const chooseBatch = (batch) => {
        setSelectedBatch(batch);
        setRowPage(0);
        setRowStatus("all");
        setRows([]);
    };

    const close = () => {
        initialSelectionDone.current = false;
        setSelectedBatch(null);
        setRows([]);
        setBatchPage(0);
        setRowPage(0);
        setRowStatus("all");
        setError("");
        setEditingRow(null);
        setReconciliation(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={close} fullWidth maxWidth="lg" aria-labelledby="chat-import-batches-title">
            <DialogTitle id="chat-import-batches-title" fontWeight="bold">Batch Staging Chat Tracking</DialogTitle>
            <DialogContent dividers>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Ini snapshot sumber dan hasil validasi. Belum ada baris staging yang diterapkan ke daftar pekerjaan aktif.
                </Alert>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Daftar batch</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 1, maxHeight: 270 }}>
                    <Table size="small" stickyHeader aria-label="Daftar batch staging">
                        <TableHead><TableRow>
                            <TableCell>Waktu</TableCell><TableCell>Batch</TableCell><TableCell>Tahun</TableCell>
                            <TableCell>Baris awal</TableCell><TableCell>Valid / Review / Invalid</TableCell>
                            <TableCell>Masalah terbuka</TableCell><TableCell>Status</TableCell><TableCell>Aksi</TableCell>
                        </TableRow></TableHead>
                        <TableBody>
                            {batches.map((batch) => (
                                <TableRow key={batch.id} selected={selectedBatch?.id === batch.id}>
                                    <TableCell>{formatTime(batch.created_at)}</TableCell>
                                    <TableCell sx={{ fontFamily: "monospace" }}>{batch.id.slice(0, 8)}</TableCell>
                                    <TableCell>{batch.source_year || "Per baris"}</TableCell>
                                    <TableCell>{batch.source_start_row}</TableCell>
                                    <TableCell>{batch.valid_count} / {batch.review_count} / {batch.invalid_count}</TableCell>
                                    <TableCell>{batch.open_issue_count}</TableCell>
                                    <TableCell>{batch.status}</TableCell>
                                    <TableCell><Button size="small" onClick={() => chooseBatch(batch)}>Lihat baris</Button></TableCell>
                                </TableRow>
                            ))}
                            {!loadingBatches && batches.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center">Belum ada batch staging.</TableCell></TableRow>
                            )}
                            {loadingBatches && (
                                <TableRow><TableCell colSpan={8} align="center">Memuat batch...</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div" count={batchTotal} page={batchPage} rowsPerPage={BATCH_PAGE_SIZE}
                    rowsPerPageOptions={[BATCH_PAGE_SIZE]} onPageChange={(_, page) => setBatchPage(page)}
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
                />

                {selectedBatch && (
                    <Box sx={{ mt: 3 }}>
                        {reconciliation && (
                            <Alert severity={reconciliation.openIssues || reconciliation.duplicateCandidateCount ? "warning" : "success"} sx={{ mb: 2 }}>
                                Rekonsiliasi: {reconciliation.batch.valid_count} valid, {reconciliation.batch.review_count} perlu tinjau,
                                {` ${reconciliation.batch.invalid_count}`} tidak valid, {reconciliation.openIssues} masalah terbuka,
                                {` ${reconciliation.duplicateCandidateCount}`} kandidat duplikat dengan pekerjaan aktif.
                                {reconciliation.duplicateCandidateCount > 0 && (
                                    <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                                        Baris sumber → ID pekerjaan aktif: {reconciliation.duplicateCandidates.map((item) =>
                                            `${item.source_row_no} → ${item.job_ids?.join(", ") || "-"}`,
                                        ).join("; ")}
                                        {reconciliation.duplicateCandidatesTruncated ? " (100 pertama)" : ""}.
                                        Kandidat perlu diperiksa manual; tidak ada pekerjaan aktif yang diubah.
                                    </Box>
                                )}
                            </Alert>
                        )}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">Baris batch {selectedBatch.id.slice(0, 8)}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedBatch.in_scope} baris bermakna dari {selectedBatch.total_rows} baris sumber.</Typography>
                            </Box>
                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <InputLabel id="chat-import-status-label">Status baris</InputLabel>
                                <Select labelId="chat-import-status-label" value={rowStatus} label="Status baris"
                                    onChange={(event) => { setRowStatus(event.target.value); setRowPage(0); }}>
                                    <MenuItem value="all">Semua</MenuItem>
                                    <MenuItem value="valid">Valid</MenuItem>
                                    <MenuItem value="review">Perlu tinjau</MenuItem>
                                    <MenuItem value="invalid">Tidak valid</MenuItem>
                                    <MenuItem value="excluded">Dikecualikan</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
                            <Table size="small" stickyHeader aria-label="Baris batch staging" sx={{ minWidth: 1350 }}>
                                <TableHead><TableRow>
                                    <TableCell>Baris</TableCell><TableCell>PIC hasil</TableCell><TableCell>Deskripsi hasil</TableCell>
                                    <TableCell>Tanggal sumber</TableCell><TableCell>Tanggal hasil</TableCell><TableCell>Waktu F</TableCell>
                                    <TableCell>Progress sumber G</TableCell><TableCell>Progress hasil</TableCell><TableCell>Keterangan H</TableCell>
                                    <TableCell>Status / masalah</TableCell><TableCell>Aksi</TableCell>
                                </TableRow></TableHead>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.source_row_no}</TableCell>
                                            <TableCell>
                                                {row.normalized_data?.nama_pic || "-"}
                                                {row.raw_data?.nama_pic !== row.normalized_data?.nama_pic && (
                                                    <Typography variant="caption" color="text.secondary" display="block">Sumber: {row.raw_data?.nama_pic || "-"}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 260 }}>{row.normalized_data?.deskripsi || "-"}</TableCell>
                                            <TableCell>{[row.raw_data?.tanggal, row.raw_data?.bulan].filter(Boolean).join(" ") || "-"}</TableCell>
                                            <TableCell>{row.normalized_data?.tanggal || "-"}</TableCell>
                                            <TableCell>{row.raw_data?.mulai_end_work || "-"}</TableCell>
                                            <TableCell>{row.raw_data?.progress || "-"}</TableCell>
                                            <TableCell>{row.normalized_data?.progress || "-"}</TableCell>
                                            <TableCell>{row.raw_data?.keterangan || "-"}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">{STATUS_LABELS[row.result_status] || row.result_status}</Typography>
                                                {row.result_reason && <Typography variant="caption" color="text.secondary">{REASON_LABELS[row.result_reason] || row.result_reason}</Typography>}
                                                {row.issues?.map((issue) => (
                                                    <Typography key={issue.id} variant="caption" display="block" color="text.secondary">
                                                        {issue.code} ({issue.status === "RESOLVED" ? "selesai" : "terbuka"}): {issue.message}
                                                    </Typography>
                                                ))}
                                                {row.review_history?.map((review) => (
                                                    <Typography key={review.review_version} variant="caption" display="block" color="text.secondary">
                                                        Review v{review.review_version}: {review.reason}
                                                    </Typography>
                                                ))}
                                            </TableCell>
                                            <TableCell>{row.result_status !== "excluded" && (
                                                <Button size="small" onClick={() => beginCorrection(row)}>Tinjau / Koreksi</Button>
                                            )}</TableCell>
                                        </TableRow>
                                    ))}
                                    {!loadingRows && rows.length === 0 && (
                                        <TableRow><TableCell colSpan={11} align="center">Tidak ada baris untuk filter ini.</TableCell></TableRow>
                                    )}
                                    {loadingRows && (
                                        <TableRow><TableCell colSpan={11} align="center">Memuat baris...</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div" count={rowTotal} page={rowPage} rowsPerPage={ROW_PAGE_SIZE}
                            rowsPerPageOptions={[ROW_PAGE_SIZE]} onPageChange={(_, page) => setRowPage(page)}
                            labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions><Button onClick={close}>Tutup</Button></DialogActions>
            <Dialog open={Boolean(editingRow)} onClose={() => !saving && setEditingRow(null)} fullWidth maxWidth="sm"
                aria-labelledby="chat-import-correction-title">
                <DialogTitle id="chat-import-correction-title">Tinjau / Koreksi baris sumber {editingRow?.source_row_no}</DialogTitle>
                <DialogContent dividers sx={{ display: "grid", gap: 2 }}>
                    <Alert severity="info">Nilai sumber tetap tersimpan apa adanya. Jika hasil baca sudah benar, beri alasan untuk menerima masalah sumber. Semua review dicatat dalam riwayat.</Alert>
                    <Typography variant="body2" color="text.secondary">
                        Sumber: {editingRow?.raw_data?.nama_pic || "-"} · {editingRow?.raw_data?.tanggal || "-"} {editingRow?.raw_data?.bulan || ""}
                    </Typography>
                    <TextField label="Nama PIC" value={correction.nama_pic || ""} onChange={(e) => setCorrection({ ...correction, nama_pic: e.target.value })} fullWidth required />
                    <TextField label="Tanggal hasil" type="date" value={correction.tanggal || ""} onChange={(e) => setCorrection({ ...correction, tanggal: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
                    <TextField label="Deskripsi" value={correction.deskripsi || ""} onChange={(e) => setCorrection({ ...correction, deskripsi: e.target.value })} fullWidth multiline minRows={3} required />
                    <TextField select label="Progress" value={correction.progress || ""} onChange={(e) => setCorrection({ ...correction, progress: e.target.value })} fullWidth required>
                        {PROGRESS_OPTIONS.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    </TextField>
                    <TextField label="Keterangan" value={correction.keterangan || ""} onChange={(e) => setCorrection({ ...correction, keterangan: e.target.value })} fullWidth multiline minRows={2} />
                    <TextField label="Alasan koreksi (wajib, minimal 10 karakter)" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth required multiline minRows={2} />
                    {error && <Alert severity="error">{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button disabled={saving} onClick={() => setEditingRow(null)}>Batal</Button>
                    <Button variant="contained" disabled={saving || reason.trim().length < 10} onClick={saveCorrection}>Simpan review</Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default ChatTrackingImportReviewDialog;
