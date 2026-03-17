import Employee from "../models/Employee";

export const createEmployee = async(req, res) => {
    try {
        const {name, email, position} = req.body;
        if(!name || !email || !position) {
            throw new AppError("Please fill all the fields", 400)
        }

        const employee = await Employee.create({name, email, position})
        res.status(201).json({success:true, employee})
    } catch (error) {
        res.status(400).json({success:false, message: error.message})
    }
}

// read employee
export const getEmployees = async(req, res) => {
    try {
        const employees = await Employee.find()
        res.status(200).json({success:true, employees})
    } catch (error) {
        res.status(400).json({success:false, message: error.message})
    }
}

// read single employee
export const getEmployeeById = async(req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
        if(!employee) {
            throw new AppError("Employee not found", 404)
        }
        res.status(200).json({success:true, employee})
    } catch (error) {

        res.status(400).json({success:false, message: error.message})
    }
}

// update employee
export const updateEmployee = async(req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {new:true})
        if(!employee) {
            throw new AppError("Employee not found", 404)
        }   
        res.status(200).json({success:true, employee})
    } catch (error) {
        res.status(400).json({success:false, message: error.message})
    }
}
// delete employee
export const deleteEmployee = async(req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id)
        if(!employee) {
            throw new AppError("Employee not found", 404)
        }
        res.status(200).json({success:true, message: "Employee deleted successfully"})
    } catch (error) {
        res.status(400).json({success:false, message: error.message})
    }
}
