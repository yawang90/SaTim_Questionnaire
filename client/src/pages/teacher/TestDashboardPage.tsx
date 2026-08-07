import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import {PlayArrow, Search} from "@mui/icons-material";

import TeacherLayout from "../../layouts/TeacherLayout";
import {activateTestId, getTeacherTests, type TeacherTest} from "../../services/TestService";
import {getClasses, type SchoolClass} from "../../services/ClassService";

const TestDashboardPage = () => {
    const [tests, setTests] = useState<TeacherTest[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [search, setSearch] = useState("");
    const [selectedTest, setSelectedTest] = useState<TeacherTest | null>(null);
    const [selectedClass, setSelectedClass] = useState<number | "">("");
    const [openDialog, setOpenDialog] = useState(false);
    const teacherId = Number(localStorage.getItem("teacherId"));
    const [snackbar, setSnackbar] = useState({
        open:false,
        message:"",
        severity:"success" as "success" | "error"
    });


    useEffect(() => {
        const load = async () => {
            try {
                const testData = await getTeacherTests(teacherId);
                setTests(testData);
                const classData = await getClasses();
                setClasses(classData);
            } catch(err) {
                console.error(err);
            }
        };
        load();
    }, []);

    const filteredTests = tests.filter(test =>
        test.title
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const activateTest = async () => {
        if(!selectedTest || !selectedClass){
            return;
        }
        try {
            await activateTestId({surveyId: selectedTest.id, classId: selectedClass});
            setSnackbar({open:true, message:"Test wurde aktiviert.", severity:"success"});
            setOpenDialog(false);
            setSelectedClass("");

        } catch(err){
            console.error(err);
            setSnackbar({
                open:true,
                message:"Test konnte nicht aktiviert werden.",
                severity:"error"
            });
        }
    };

    return (
        <TeacherLayout>
            <Box sx={{maxWidth:1000, mx:"auto", py:3}}>
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open:false})}>
                    <Alert severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">
                            Meine Tests
                        </Typography>

                        <Typography color="text.secondary">
                            Tests verwalten und für Klassen aktivieren.
                        </Typography>
                    </Box>
                </Box>

                <Card sx={{mb:3}}>
                    <CardHeader title="Filter"/>
                    <CardContent>

                        <TextField
                            fullWidth
                            label="Test suchen"
                            value={search}
                            onChange={(e)=>
                                setSearch(e.target.value)
                            }
                            InputProps={{
                                startAdornment:<Search/>
                            }}
                        />
                    </CardContent>
                </Card>

                <Card>

                    <CardHeader
                        title={`Tests (${filteredTests.length})`}
                    />
                    <CardContent>
                        {
                            filteredTests.length === 0 ? (
                                <Typography color="text.secondary">
                                    Keine Tests gefunden.
                                </Typography>
                            ) : (
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {
                                        filteredTests.map(test => (
                                            <Card key={test.id} variant="outlined">

                                                <CardContent>
                                                    <Box
                                                        display="flex"
                                                        justifyContent="space-between">

                                                        <Typography variant="h6">
                                                            {test.title}
                                                        </Typography>

                                                        <Chip label={test.status}/>
                                                    </Box>

                                                    <Typography color="text.secondary" mt={1}>
                                                        {test.description || "Keine Beschreibung"}
                                                    </Typography>

                                                    <Button sx={{mt:2}} variant="contained" startIcon={<PlayArrow/>} onClick={()=>{setSelectedTest(test);setOpenDialog(true);}}>
                                                        Aktivieren
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                        ))}
                                </Box>)}
                    </CardContent>

                </Card>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>

                    <DialogTitle>
                        Test aktivieren
                    </DialogTitle>

                    <DialogContent>
                        <Typography mb={2}>
                            {selectedTest?.title}
                        </Typography>


                        <Select
                            fullWidth
                            value={selectedClass}
                            onChange={(e)=> setSelectedClass(Number(e.target.value))}
                            displayEmpty>

                            <MenuItem value="">
                                Klasse auswählen
                            </MenuItem>


                            {
                                classes.map(c=>(
                                    <MenuItem
                                        key={c.id}
                                        value={c.id}
                                    >
                                        {c.name}
                                    </MenuItem>
                                ))
                            }

                        </Select>

                    </DialogContent>
                    <DialogActions>

                        <Button onClick={()=> setOpenDialog(false)}>
                            Abbrechen
                        </Button>


                        <Button variant="contained" onClick={activateTest}>
                            Aktivieren
                        </Button>

                    </DialogActions>


                </Dialog>

            </Box>

        </TeacherLayout>

    );
};


export default TestDashboardPage;
