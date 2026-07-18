import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import { ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useEffect, useMemo, useState } from "react";

import { DarkMaterialUITheme, LightMaterialUITheme, oldLightMaterialUITheme } from "../theme/theme";
import type { GalleryEntry } from "./manifest";
import { GALLERY } from "./manifest";

const DRAWER_WIDTH = 280;

const THEMES = {
    "Light (default)": oldLightMaterialUITheme,
    "Light (MD)": LightMaterialUITheme,
    "Dark (MD)": DarkMaterialUITheme,
} as const;

type ThemeName = keyof typeof THEMES;

function entryFromHash(): GalleryEntry {
    const name = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    return GALLERY.find((e) => e.name === name) || GALLERY[0];
}

export default function GalleryApp() {
    const [selected, setSelected] = useState<GalleryEntry>(entryFromHash);
    const [themeName, setThemeName] = useState<ThemeName>("Light (default)");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const onHashChange = () => setSelected(entryFromHash());
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    const grouped = useMemo(() => {
        const visible = GALLERY.filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()));
        const byCategory = new Map<string, GalleryEntry[]>();
        visible.forEach((entry) => {
            const list = byCategory.get(entry.category) || [];
            list.push(entry);
            byCategory.set(entry.category, list);
        });
        return byCategory;
    }, [filter]);

    return (
        <ThemeProvider theme={THEMES[themeName]}>
            <CssBaseline />
            <Box sx={{ display: "flex" }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar sx={{ gap: 2 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            cove — Component Gallery
                        </Typography>
                        <TextField
                            select
                            size="small"
                            value={themeName}
                            onChange={(event) => setThemeName(event.target.value as ThemeName)}
                            sx={{ minWidth: 170, bgcolor: "background.paper", borderRadius: 1 }}>
                            {Object.keys(THEMES).map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Link
                            href="https://github.com/mat3ra/cove"
                            color="inherit"
                            underline="hover"
                            target="_blank"
                            rel="noreferrer">
                            GitHub
                        </Link>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
                    }}>
                    <Toolbar />
                    <Box sx={{ p: 1.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Filter components…"
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                        />
                    </Box>
                    <Box sx={{ overflow: "auto" }}>
                        {Array.from(grouped.entries()).map(([category, entries]) => (
                            <List
                                key={category}
                                dense
                                subheader={<ListSubheader>{category}</ListSubheader>}>
                                {entries.map((entry) => (
                                    <ListItemButton
                                        key={entry.name}
                                        selected={entry.name === selected.name}
                                        onClick={() => {
                                            window.location.hash = encodeURIComponent(entry.name);
                                        }}>
                                        <ListItemText primary={entry.name} />
                                    </ListItemButton>
                                ))}
                            </List>
                        ))}
                    </Box>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
                    <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography variant="h5">{selected.name}</Typography>
                        <Chip size="small" label={selected.category} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        {selected.source}
                    </Typography>
                    <Paper variant="outlined" sx={{ mt: 1.5, p: 3 }}>
                        {/* key remounts demo state on selection change */}
                        <Box key={selected.name}>{selected.render()}</Box>
                    </Paper>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
